(function () {

    const MODPLUG_AUDIO_FORMATS = '.mod,.xm,.s3m,.stm,.it';

    var lib = angular.module("Library", ["Site"]);

    lib.run(["$rootScope", "TrackAction", function ($scope, TrackAction) {
        $scope.copyTrack = function ($track) {
            TrackAction.copyTrackToSelf($track);
        };
    }]);

    lib.controller("StreamLibraryController", ["$scope", "$rootScope", "TrackWorks", "StreamWorks",
        "$streams", "$routeParams", "AudioInfoEditor", "TrackAction", "Popup", "TrackPreviewService",
        "ngDialog", "$location",

        function ($scope, $rootScope, TrackWorks, StreamWorks, Streams,
                  $routeParams, AudioInfoEditor, TrackAction, Popup, TrackPreviewService,
                  ngDialog, $location) {

            $scope.tracksPending = true;
            $scope.tracks = [];
            $scope.stream = {};
            $scope.target = [];
            $scope.filter = "";
            $scope.busy = false;
            $scope.empty = false;

            $scope.$watch("tracks.length", function () {
                $scope.empty = $scope.tracks.length === 0;
            });

            $scope.clear = function () {
                $scope.filter = "";
                $scope.load(true);
            };

            $scope.numberTracks = function () {
                for (var i = 0, length = $scope.tracks.length; i < length; i += 1) {
                    $scope.tracks[i].t_order = i + 1;
                }
                $scope.$apply();
            };

            $scope.sortableOptions = {
                axis: 'y',
                items: ".item:visible",
                stop: function (event, ui) {
                    var thisElement = angular.element(ui.item).scope(),
                        thisIndex = thisElement.$index;
                    $scope.sort(thisElement.track.unique_id, thisIndex);
                },
                helper: function (e, tr) {
                    var $originals = tr.children();
                    var $helper = tr.clone();
                    $helper.children().each(function (index) {
                        $(this).width($originals.eq(index).width())
                    });
                    return $helper;
                }
            };

            var streamId = $routeParams.id;

            $scope.readStream = function () {
                Streams.getByID(streamId).onSuccess(function (res) {
                    $scope.stream = res;
                });
            };

            /* Tracks Manipulation */
            $scope.upload = function () {
                $scope.options = {
                    target: $scope.stream.sid,
                    append: true,
                    onFinish: function () {
                        $scope.load(true);
                    }
                };
                ngDialog.open({
                    templateUrl: "/views/auth/upload.html",
                    controller: "UploadController",
                    scope: $scope,
                    showClose: false,
                    closeByDocument: false
                });
            };

            $scope.load = function (clear) {

                clear = clear || false;
                var offset = clear ? 0 : $scope.tracks.length;

                $scope.busy = true;

                TrackWorks.getByStreamID(streamId, offset, $scope.filter).onSuccess(function (data) {

                    if (clear) {
                        $scope.tracks = data;
                    } else for (var i = 0; i < data.length; i++) {
                        $scope.tracks.push(data[i]);
                    }

                    $scope.tracksPending = false;

                    if (data.length > 0) {
                        $scope.busy = false;
                    } else if ($scope.tracks.length === 0) {
                        $scope.empty = true;
                    }

                }, function () {
                    $location.url("/profile/streams/");
                });

                $scope.readStream();

            };

            $scope.deleteSelected = function () {

                TrackPreviewService.stop();
                TrackAction.removeTracksFromStream($scope.stream, $scope.target, function () {
                    Popup.message($rootScope.tr("FR_TRACKS_REMOVED_FROM_STATION", {
                        count: $scope.target.length,
                        name: $scope.stream.name
                    }));
                    deleteMatching($scope.tracks, function (track) {
                        return $scope.target.indexOf(track) !== -1;
                    });
                    truncateArray($scope.target);
                    $rootScope.account.init();
                    $scope.readStream();
                });

            };

            $scope.deleteCompletelySelected = function () {

                TrackPreviewService.stop();
                TrackAction.removeTracksFromAccount($scope.target, function () {
                    Popup.message($rootScope.tr("FR_TRACKS_REMOVED_FROM_LIBRARY", {count: $scope.target.length}));
                    deleteMatching($scope.tracks, function (track) {
                        return $scope.target.indexOf(track) !== -1;
                    });
                    truncateArray($scope.target);
                    $rootScope.account.init();
                    $scope.readStream();
                });

            };

            $scope.downloadSelected = function () {
                if ($scope.target.length === 0) {
                    return;
                }

                const [track,] = $scope.target;

                if (!track) {
                    return;
                }

                window.open(`/radio-manager/api/v0/tracks/${track.tid}/download`, '_blank');
            };

            $scope.shuffle = function () {
                StreamWorks.shuffle(streamId).onSuccess(function () {
                    $scope.load(true);
                });
            };

            $scope.sort = function (uniqueId, newIndex) {
                StreamWorks.sort(streamId, uniqueId, newIndex + 1).onSuccess(function () {

                });
            };

            $scope.addToStream = function (stream) {
                TrackAction.addTracksToStream(stream, $scope.target, function () {
                    Popup.message($rootScope.tr("FR_TRACKS_ADDED_TO_STATION", {
                        count: $scope.target.length,
                        name: stream.name
                    }));
                    if (stream.sid === $scope.stream.sid) {
                        $scope.load(true);
                    }
                    $rootScope.account.init();
                    $scope.readStream();
                });
            };

            $scope.moveToStream = function (stream) {
                TrackAction.moveTracksToOtherStream($scope.stream, $scope.target, stream, function () {
                    Popup.message($rootScope.tr("FR_TRACKS_MOVED_TO_STATION", {
                        count: $scope.target.length,
                        name: stream.name
                    }));
                    deleteMatching($scope.tracks, function (track) {
                        return $scope.target.indexOf(track) !== -1;
                    });
                    truncateArray($scope.target);
                    $rootScope.account.init();
                    $scope.readStream();
                });
            };

            $scope.changeGroup = function (groupObject) {
                TrackAction.changeTracksColor(groupObject, $scope.target, function () {
                    for (var n = 0; n < $scope.target.length; n += 1) {
                        $scope.target[n].color = groupObject.color_id;
                    }
                });
            };

            $scope.playFrom = function () {

                var id = $scope.target[0].unique_id;

                StreamWorks.play(id, $scope.stream);

            };

            $scope.edit = function () {
                AudioInfoEditor.show($scope.target, $scope);
            };

            $scope.remove = function () {
                TrackAction.deleteStream($scope.stream, function () {
                    Popup.tr("FR_STREAM_DELETED_SUCCESSFULLY", $scope.stream);
                    $rootScope.account.init("/profile/streams/");
                });
            };

            $scope.readStream();

        }
    ]);

    lib.controller("TracksLibraryController", ["$rootScope", "$scope", "TrackWorks", "StreamWorks",
        "ngDialog", "$route", "$dialog", "AudioInfoEditor", "TrackAction", "Popup", "TrackPreviewService",

        function ($rootScope, $scope, TrackWorks, StreamWorks, ngDialog, $route,
                  $dialog, AudioInfoEditor, TrackAction, Popup, TrackPreviewService) {

            $scope.tracksPending = true;
            $scope.tracks = [];
            $scope.target = [];
            $scope.filter = "";
            $scope.busy = false;

            $scope.sorting = {
                row: 0,
                order: 0,
                change: function (row, order) {
                    if (typeof order == "number") {
                        $scope.sorting.row = row;
                        $scope.sorting.order = order;
                    } else if (row === $scope.sorting.row) {
                        $scope.sorting.order = 1 - $scope.sorting.order;
                    } else {
                        $scope.sorting.order = 0;
                        $scope.sorting.row = row;
                    }
                    $scope.load(true, true);
                }
            };

            $scope.clear = function () {
                $scope.filter = "";
                $scope.load(true);
            };

            $scope.load = function (clear, busy) {

                clear = clear || false;

                $scope.busy = true;

                if (clear) {
                    $scope.tracksPending = true;
                    $scope.tracks = [];
                }

                TrackWorks.getAllTracks($scope.tracks.length, $scope.filter, $route.current.unused === true, $scope.sorting.row, $scope.sorting.order, busy)
                    .onSuccess(function (data) {

                        if (clear) {
                            $scope.tracks = data;
                        } else for (var i = 0; i < data.length; i++) {
                            $scope.tracks.push(data[i]);
                        }

                        $scope.tracksPending = false;

                        if (data.length > 0) {
                            $scope.busy = false;
                        }

                    });

            };

            /* Tracks Manipulation */
            $scope.upload = function () {
                ngDialog.open({
                    templateUrl: "/views/auth/upload.html",
                    controller: "UploadController",
                    scope: $scope,
                    showClose: false,
                    closeByDocument: false
                });
            };

            $scope.deleteSelected = function () {
                TrackPreviewService.stop(); //147
                TrackAction.removeTracksFromAccount($scope.target, function () {
                    Popup.message($rootScope.tr("FR_TRACKS_REMOVED_FROM_LIBRARY", {count: $scope.target.length}));
                    deleteMatching($scope.tracks, function (track) {
                        return $scope.target.indexOf(track) !== -1;
                    });
                    truncateArray($scope.target);
                    $rootScope.account.init();
                });
            };

            $scope.downloadSelected = function () {
                if ($scope.target.length === 0) {
                    return;
                }

                const [track,] = $scope.target;

                if (!track) {
                    return;
                }

                window.open(`/radio-manager/api/v0/tracks/${track.tid}/download`, '_blank');
            };

            $scope.addToStream = function (streamObject) {
                TrackAction.addTracksToStream(streamObject, $scope.target, function () {
                    Popup.message($rootScope.tr("FR_TRACKS_ADDED_TO_STATION", {
                        count: $scope.target.length,
                        name: streamObject.name
                    }));
                    if ($route.current.unused === true) {
                        deleteMatching($scope.tracks, function (track) {
                            return $scope.target.indexOf(track) !== -1
                        });
                        truncateArray($scope.target);
                    }
                    $rootScope.account.init();
                });
            };

            $scope.changeGroup = function (groupObject) {
                TrackAction.changeTracksColor(groupObject, $scope.target, function () {
                    Popup.message($rootScope.tr("FR_TRACKS_UPDATED", {count: $scope.target.length}));
                    for (var n = 0; n < $scope.target.length; n += 1) {
                        $scope.target[n].color = groupObject.color_id;
                    }
                });
            };

            $scope.edit = function () {
                AudioInfoEditor.show($scope.target, $scope);
            };

        }

    ]);

    lib.controller("UploadController", ["$scope", "$rootScope", "TrackWorks", "StreamWorks",
        "Response", "$http", "$q", "Popup", "$analytics", "$library",

        function ($scope, $rootScope, TrackWorks, StreamWorks, Response, $http, $q, Popup, $analytics, $library) {

            $scope.upNext = false;
            $scope.progress = {
                status: false,
                file: null,
                percent: 0
            };
            $scope.uploadQueue = [];

            $scope.options = $scope.options || {
                target: null,
                append: false,
                unique: false,
                onFinish: function () {
                }
            };

            var canceller = $q.defer(),
                promise = null;

            $scope.browse = function () {
                var selector = $("<input>");
                selector.attr("type", "file");
                selector.attr("accept", `audio/*,${MODPLUG_AUDIO_FORMATS}`);
                selector.attr("multiple", "multiple");
                selector.attr("name", "file");
                selector.on("change", function () {
                    if (this.files.length === 0) return;
                    var that = this;
                    $scope.$applyAsync(function () {
                        for (var i = 0; i < that.files.length; i++) if (that.files[i].size <= Of.megabytes(512)) {
                            $scope.uploadQueue.push(that.files[i]);
                        }
                    });
                });
                selector.click();
            };

            $scope.cancel = function () {
                $scope.options.onFinish.call();
                $scope.closeThisDialog();
            };

            $scope.$on("$destroy", function () {
                if (promise !== null) {
                    promise.abort();
                }
            });

            $scope.upload = function () {
                if ($scope.uploadQueue.length === 0) {
                    $scope.cancel();
                    return;
                }
                var file = $scope.uploadQueue.shift();
                var form = new FormData();
                var progress = function (evt) {

                    if (evt.lengthComputable) {

                        var percentComplete = evt.loaded / evt.total;
                        percentComplete = parseInt(percentComplete * 100, 10);

                        $(".progress-cursor").css("width", percentComplete + "%");

                    }

                };

                form.append('file', file);

                if ($scope.options.target)
                    form.append("stream_id", $scope.options.target);

                if ($scope.options.unique)
                    form.append("skip_copies", 1);

                $scope.progress.status = true;
                $scope.progress.file = file.name;


                promise = $library.upload(form, progress);

                promise.then(function (data) {

                    var i;

                    promise = null;

                    if ($scope.options.append === true) {
                        for (i = 0; i < data.tracks.length; i++) {
                            $scope.$parent.tracks.push(data.tracks[i]);
                            $rootScope.account.user.tracks_count += 1;
                        }
                    } else {
                        for (i = data.tracks.length - 1; i >= 0; i--) {
                            $scope.$parent.tracks.unshift(data.tracks[i]);
                            $rootScope.account.user.tracks_count += 1;
                        }
                    }

                    $rootScope.account.init();

                    $analytics.eventTrack('Upload', {category: 'Actions'});
                    $scope.upload();

                }, function (message) {

                    Popup.message(message);
                    $scope.upload();

                });

            };

        }

    ]);

    lib.factory("TracksScopeActions", [function () {
        return {
            removeTracksFromStream: function ($stream, $tracks, $callback) {
                TrackPreviewService.stop();

            }
        }
    }]);

    lib.factory("StreamWorks", ["$http", "Response", function ($http, Response) {
        return {
            getMyStreams: function () {
                var result = $http({
                    method: "GET",
                    url: "/api/v2/streams/getStreamsByUser"
                });
                return Response(result);
            },
            deleteTracks: function (streamId, track_id) {
                var result = $http({
                    method: "POST",
                    url: "/api/v2/stream/removeTracks",
                    data: {
                        stream_id: streamId,
                        unique_ids: track_id
                    }
                });
                return Response(result);
            },
            addTracks: function (streamId, trackId) {
                var result = $http({
                    method: "POST",
                    url: "/api/v2/stream/addTracks",
                    data: {
                        stream_id: streamId,
                        tracks: trackId
                    }
                });
                return Response(result);
            },
            shuffle: function (streamId) {
                var result = $http({
                    method: "POST",
                    url: "/api/v2/control/shuffle",
                    busy: true,
                    data: {
                        stream_id: streamId
                    }
                });
                return Response(result);
            },
            sort: function (streamId, uniqueId, index) {
                var result = $http({
                    method: "POST",
                    url: "/api/v2/stream/moveTrack",
                    data: {
                        stream_id: streamId,
                        unique_id: uniqueId,
                        new_index: index
                    }
                });
                return Response(result);
            },
            startStream: function (object) {
                var result = $http({
                    method: "POST",
                    url: "/api/v2/control/play",
                    data: {
                        stream_id: object.sid
                    }
                });
                return Response(result);
            },
            stopStream: function (object) {
                var result = $http({
                    method: "POST",
                    url: "/api/v2/control/stop",
                    data: {
                        stream_id: object.sid
                    }
                });
                return Response(result);
            },
            play: function (unique_id, object) {
                var result = $http({
                    method: "POST",
                    url: "/api/v2/control/setCurrentTrack",
                    data: {
                        stream_id: object.sid,
                        unique_id: unique_id
                    }
                });
                return Response(result);
            }
        }
    }]);

    lib.factory("TrackWorks", ["$http", "Response", function ($http, Response) {
        return {
            getAllTracks: function (offset, filter, unused, row, order, busy) {
                var result = $http({
                    method: "GET",
                    url: "/radio-manager/api/v0/tracks/",
                    busy: busy || false,
                    params: { offset, filter, unused, row, order }
                });
                return Response(result);
            },
            getByStreamID: function (stream_id, offset, filter, color_id = "") {
                var result = $http({
                    method: "GET",
                    url: `/radio-manager/api/v0/streams/${stream_id}/tracks/`,
                    busy: false,
                    params: { color_id, offset, filter }
                });
                return Response(result);
            },
            getTrackDetails: function (track_id) {
                var result = $http({
                    method: "GET",
                    url: "/api/v2/tracks/getTrackDetails",
                    params: {
                        track_id: track_id
                    }
                });
                return Response(result);
            },
            updateTrackInfo: function (track) {
                var result = $http({
                    method: "POST",
                    url: "/api/v2/track/edit",
                    data: {
                        track_id: track.tid,
                        artist: track.artist,
                        title: track.title,
                        album: track.album,
                        track_number: track.track_number,
                        genre: track.genre,
                        date: track.date,
                        color_id: track.color
                    }
                });
                return Response(result);
            },
            updateColor: function (tracks, colorId) {
                var result = $http({
                    method: "POST",
                    url: "/api/v2/track/changeColor",
                    data: {
                        track_id: tracks,
                        color_id: colorId
                    }
                });
                return Response(result);
            },
            deleteTracks: function (track_id) {
                var result = $http({
                    method: "POST",
                    url: "/api/v2/track/delete",
                    data: {
                        track_id: track_id
                    }
                });
                return Response(result);
            },
            copyTrack: function (track_id, destination_stream, up_next) {
                return Response($http({
                    method: "POST",
                    url: "/api/v2/track/copy",
                    data: {
                        track_id: track_id,
                        stream_id: destination_stream,
                        up_next: up_next
                    }
                }));
            }
        };
    }]);

})();

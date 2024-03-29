/**
 * Created by roman on 31.12.14.
 */

import { reaction } from 'mobx'

(function () {
    var player = angular.module("RadioPlayer", ['Site']);

    player.run(["$rootScope", "$http", "Response", "$streams", "$timeout", "$location", "Popup", "$analytics", "TrackPreviewService", "$filter",

        function ($rootScope, $http, Response, Streams, $timeout, $location, Popup, $analytics, TrackPreviewService, $filter) {

            var handle = false;

            $rootScope.player = {
                isPlaying: false,
                isLoaded: false,
                isBuffering: false,
                nowPlaying: null,
                currentID: null,
                currentStream: null,
                url: null,
                page: undefined,
                visible: true,
                goCurrent: function () {
                    $location.url($rootScope.player.page);
                },
                controls: {
                    reload: function () {
                        const $stream = $rootScope.player.currentStream;
                        if ($rootScope.player.isPlaying === true) {
                            $rootScope.player.controls.stop();
                            $rootScope.player.url = "/flow?s=" + $stream.sid + "&f=" + $rootScope.defaults.format + "&client_id=" + htmlEscape($rootScope.account.client_id);
                            $rootScope.player.controls.play();
                        }
                    },
                    loadStream: function ($stream) {

                        if ($rootScope.player.isPlaying) {
                            $rootScope.player.controls.stop();
                        }

                        $rootScope.player.url = "/flow?s=" + $stream.sid + "&f=" + $rootScope.defaults.format + "&client_id=" + htmlEscape($rootScope.account.client_id);
                        $rootScope.player.currentID = $stream.sid;
                        $rootScope.player.currentStream = $stream;
                        $rootScope.player.page = "/streams/" + $stream.key;
                        $rootScope.player.isLoaded = true;
                        $rootScope.player.controls.play();

                    },
                    play: function () {

                        $analytics.eventTrack('Play', { category: 'Streams', label: $rootScope.player.currentID });

                        $rootScope.player.isBuffering = true;
                        realPlayer.play($rootScope.player.url);
                        $rootScope.player.isPlaying = true;

                        if (angular.isObject($rootScope.player.currentStream)) {
                            $rootScope.player.currentStream.listeners_count++;
                            $rootScope.$broadcast("sync:update:sid", $rootScope.player.currentStream);
                        }

                        TrackPreviewService.stop();

                    },
                    stop: function () {

                        $rootScope.player.isPlaying = false;

                        realPlayer.stop();

                        $timeout.cancel(handle);

                        if (angular.isObject($rootScope.player.currentStream)) {
                            $rootScope.player.currentStream.listeners_count --;
                            $rootScope.$broadcast("sync:update:sid", $rootScope.player.currentStream);
                        }

                        $rootScope.player.isBuffering = false;
                        $rootScope.player.nowPlaying = null;

                    },
                    switch: function () {
                        $rootScope.player.isPlaying ?
                            $rootScope.player.controls.stop() :
                            $rootScope.player.controls.play();
                    },
                    playSwitchStream: function ($stream) {
                        if (angular.isObject($rootScope.player.currentStream) && $rootScope.player.currentStream.sid == $stream.sid) {
                            $rootScope.player.controls.switch();
                        } else {
                            $rootScope.player.controls.loadStream($stream);
                        }
                    },
                    unload: function () {
                        $rootScope.player.controls.stop();
                        $rootScope.player.currentID = null;
                        $rootScope.player.currentStream = null;
                        $rootScope.player.page = null;
                        $rootScope.player.isLoaded = false;
                    }
                }
            };

            $rootScope.$watch("player.nowPlaying.unique_id", function (newValue) {
                if (newValue && $rootScope.player.isPlaying) {
                    Popup.message("<b>" + htmlEscape($filter("trackCaption")($rootScope.player.nowPlaying)) + "</b><br>" + htmlEscape($rootScope.player.currentStream.name), 5000);
                }
            });

            var realHandle = null;
            var realPlayer = {
                play: function (url, onPlay) {

                    onPlay = onPlay || function () {
                    };

                    realPlayer.stop();
                    realHandle = new Audio5js({
                        swf_path: "/swf/audio5js.swf",
                        codecs: ['mp3'],
                        ready: function () {
                            this.on("timeupdate", function () {
                                if ($rootScope.player.isBuffering == true) {
                                    $rootScope.player.isBuffering = false;
                                    $rootScope.$digest();
                                }
                            });
                            this.on("ended", function () {
                                if ($rootScope.player.isPlaying) {
                                    $timeout(function () {
                                        realPlayer.play(url)
                                    }, 1000);
                                }
                            });
                            this.on("error", function () {
                                if ($rootScope.player.isPlaying) {
                                    $rootScope.player.isBuffering = true;
                                    $timeout(function () {
                                        realPlayer.play(url)
                                    }, 1000);
                                }
                            });

                            this.load(url);
                            this.play();
                        }
                    });
                },
                stop: function () {
                    if (realHandle instanceof Audio5js) {
                        realHandle.destroy();
                    }
                    realHandle = null;
                }
            };

        }

    ]);

    player.directive("play", ["$rootScope", function ($rootScope) {
        return {
            scope: {
                channel: "="
            },
            template: `
                <div class="play-pause">
                    <div mobx-autorun ng-hide="$root.$store.playingChannelId === channel.sid" class="toggle" 
                         ng-click="$root.$store.playChannel(channel, $root.defaults.format)"
                         mor-tooltip="Play"><i mobx-autorun class="icon-play-arrow"></i>
                    </div>                
                    <div mobx-autorun ng-show="$root.$store.playingChannelId === channel.sid" class="toggle" 
                         ng-click="$root.$store.stopChannel()"
                         mor-tooltip="Play"><i class="icon-stop"></i>
                    </div>
                </div>`,
            link: function (scope, element, attrs) {

                const dispose = reaction(() => $rootScope.$store.playingChannel, (channel) => {
                    if (channel?.sid === scope.channel?.sid) {
                        element.addClass("active");
                    } else {
                        element.removeClass("active");
                    }
                }, {
                    fireImmediately: true
                })

                scope.$on("$destroy", dispose)
            }
        }
    }]);

    player.directive("preview", ["TrackPreviewService", function (TrackPreviewService) {
        return {
            template: '<span class="only-first-element" mor-tooltip="{{ $root.tr(\'FR_PLAYER_CLICK_TO_REVIEW\') }}">' +
                '<i ng-if="!isRadioPlayerPlaying" class="icon-play-circle-fill"></i>' +
                '<i ng-if="isRadioPlayerPlaying" class="icon-pause-circle-fill"></i>' +
                '</span>',
            restrict: "E",
            require: "ngModel",
            scope: {
                ngModel: "="
            },
            link: function ($scope, $element, $attrs) {
                $scope.isPlaying = false;
                $element.on("mousedown", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    TrackPreviewService.play($scope.ngModel);
                    $scope.ngModel.is_new = 0;
                });
                $scope.$on("preview.start", function (event, track) {
                    if ($scope.ngModel == null) return;
                    if (track.tid == $scope.ngModel.tid) {
                        $scope.isPlaying = true;
                        $scope.$applyAsync();
                    }
                });
                $scope.$on("preview.stop", function (event, track) {
                    $scope.isPlaying = false;
                    $scope.$applyAsync();
                });
                TrackPreviewService.ifSomethingIsPlaying(function () {
                    if ($scope.ngModel == null) return;
                    if (this.tid == $scope.ngModel.tid) {
                        $scope.isPlaying = true;
                    }
                });
            }
        };
    }]);

    player.factory("TrackPreviewService", ["$rootScope", "Popup",

        function ($rootScope, Popup) {

            var jPlayer = $("<div></div>").appendTo("body").jPlayer({
                swfPath: "jplayer",
                supplied: "mp3",
                play: function (event) {
                    $rootScope.player.controls.stop();
                    $rootScope.$broadcast("preview.start", currentTrack);
                },
                ended: function (event) {
                    $rootScope.$broadcast("preview.stop");
                    currentTrack = null;
                },
                error: function (event) {
                    Popup.message("Error: " + htmlEscape(event.jPlayer.error.message));
                    $rootScope.$broadcast("preview.stop");
                    currentTrack = null;
                },
                solution: "html, flash",
                volume: 1,
                wmode: 'window'
            });

            var currentTrack = null;

            var service = {
                play: function (object) {
                    if (currentTrack != null && currentTrack.tid == object.tid) {
                        service.stop();
                    } else {
                        service.stop();
                        jPlayer.jPlayer("setMedia", { mp3: "/content/audio/".concat(object.tid) });
                        jPlayer.jPlayer("play");
                        currentTrack = object;
                    }
                },
                stop: function () {
                    jPlayer.jPlayer("clearMedia");
                    $rootScope.$broadcast("preview.stop");
                    currentTrack = null;
                },
                ifSomethingIsPlaying: function (callback) {
                    if (currentTrack != null)
                        callback.call(currentTrack);
                }
            };

            return service;

        }

    ]);

})();


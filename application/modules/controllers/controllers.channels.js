/**
 * Created by roman on 05.04.15.
 */
(function () {

    var module = angular.module("application");

    module.controller("ChannelListCategory", ["channelsData", "$scope", "$channels", "ChannelListActions",

        function (channelsData, $scope, $channels, ChannelListActions) {
            $scope.data = channelsData;
            $scope.empty = channelsData.channels.items.length == 0;
            $scope.busy = false;
            $scope.actionProvider = ChannelListActions;
            $scope.load = function () {
                $scope.busy = true;
                $channels.getCategoryChannels($scope.data.channels.length).then(function (data) {
                    for (var i = 0; i < data.channels.length; i++) {
                        $scope.data.channels.items[null] = data.channels.items[i];
                    }
                    $scope.busy = false;
                });
            }
        }

    ]);

    module.controller("ChannelListTag", ["channelsData", "$scope", "$channels", "ChannelListActions", "$routeParams",

        function (channelsData, $scope, $channels, ChannelListActions, $routeParams) {
            $scope.data = channelsData;
            $scope.empty = channelsData.channels.items.length == 0;
            $scope.busy = false;
            $scope.actionProvider = ChannelListActions;
            $scope.load = function () {
                $scope.busy = true;
                $channels.getTagChannels($routeParams.tag, $scope.data.channels.length).then(function (data) {
                    for (var i = 0; i < data.channels.length; i++) {
                        $scope.data.channels.items[null] = data.channels.items[i];
                    }
                    $scope.busy = false;
                });
            }
        }

    ]);

    module.controller("ChannelListSearch", ["channelsData", "$scope", "$channels", "ChannelListActions", "$routeParams",

        function (channelsData, $scope, $channels, ChannelListActions, $routeParams) {
            $scope.data = channelsData;
            $scope.empty = channelsData.channels.items.length == 0;
            $scope.busy = false;
            $scope.actionProvider = ChannelListActions;
            $scope.load = function () {
                $scope.busy = true;
                $channels.getSearchChannels($routeParams.query, $scope.data.channels.length).then(function (data) {
                    for (var i = 0; i < data.channels.length; i++) {
                        $scope.data.channels.items[null] = data.channels.items[i];
                    }
                    $scope.busy = false;
                });
            }
        }

    ]);

    module.controller("ChannelListUser", ["channelsData", "$scope", "$channels", "ChannelListActions", "$routeParams",

        function (channelsData, $scope, $channels, ChannelListActions, $routeParams) {
            $scope.data = channelsData;
            $scope.data.name = channelsData.user.name ? channelsData.user.name : channelsData.user.login;
            $scope.empty = channelsData.channels.items.length == 0;
            $scope.busy = false;
            $scope.actionProvider = ChannelListActions;
            $scope.load = function () {
                $scope.busy = true;
                $channels.getUserChannels($routeParams.key, $scope.data.channels.length).then(function (data) {
                    for (var i = 0; i < data.channels.length; i++) {
                        $scope.data.channels.items[null] = data.channels.items[i];
                    }
                    $scope.busy = false;
                });
            }
        }

    ]);

    module.factory("ChannelListActions", ["$channels", "$bookmarks", "Popup", "$rootScope",

        function ($channels, $bookmarks, Popup, $rootScope) {
            return function (channel) {
                return {
                    bookmark: function () {
                        if (channel.bookmarked === 1) {
                            $bookmarks.removeBookmark(channel).then(function () {
                                Popup.message($rootScope.tr("FR_BOOKMARK_REMOVE_SUCCESS", [ channel.name ]));
                                channel.bookmarked = 0;
                                channel.bookmarks_count --;
                            }, function (message) {
                                Popup.message(message);
                            });
                        } else {
                            $bookmarks.addBookmark(channel).then(function () {
                                Popup.message($rootScope.tr("FR_BOOKMARK_ADD_SUCCESS", [ channel.name ]));
                                channel.bookmarked = 1;
                                channel.bookmarks_count ++;
                            }, function (message) {
                                Popup.message(message);
                            });
                        }
                    },
                    share: function (callback) {

                    }
                }
            }
        }

    ]);

    module.filter("channelArtwork", [function () {
        return function (source) {
            return "content/streamcovers/" + source;
        }
    }]);


    module.filter("channelLink", [function () {
        return function (channel) {
            return "/streams/" + (channel.permalink ? channel.permalink : channel.sid);
        }
    }]);

})();
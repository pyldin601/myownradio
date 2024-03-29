/**
 * Created by Roman on 08.12.2014.
 */
const { default: mobxAngular } = require('mobx-angularjs');

var SITE_TITLE =  "Radioterio - Your own web radio station";

(function () {

    var md = angular.module("application", [

        "ngRoute", "ngAnimate", "ngDialog", "ngTouch", "ng",
        "angular-loading-bar", 'angulartics', 'angulartics.google.analytics',
        "httpPostFix", "infinite-scroll", "ng-context-menu", "ui.sortable", 'seo', "mor-popup",

        "Account", "Site", "Catalog", "RadioPlayer", "Search", "Profile", "Library", "AudioInfo", "mor-loader", "Dialogs",

        "mor.stream.scheduler", "mor.tools", "contenteditable", "analytics.mixpanel", mobxAngular

    ]);

    md.controller("MainController", [function () { }]);

    angular.module('analytics.mixpanel').config(['$mixpanelProvider', function ($mixpanelProvider) {
        $mixpanelProvider.apiKey('02099ce8dcddbc93c2a4e0842d124635');
    }]);

    var settings = {
        REST_LOCATION: "http://radioter.io/api/v2",
        STREAMS_PER_PAGE: 50
    };

    var routes = {
        /* Home Page */
        PATH_HOME: ["/", {
            templateUrl: "/views/home.html",
            rootClass: "image"
        }],

        PATH_LOGIN: ["/login/", {
            templateUrl: "/views/login.html",
            controller: "LoginForm"
        }],

        PATH_RECOVER_PASSWORD1: ["/recover", {
            templateUrl: "/views/forms/recoverPassword1.html",
            controller: "PasswordResetBeginForm"
        }],

        PATH_RECOVER_PASSWORD2: ["/recover/:code", {
            templateUrl: "/views/forms/recoverPassword2.html",
            controller: "PasswordResetCompleteForm"
        }],

        PATH_SIGN_UP_BEGIN: ["/signup", {
            templateUrl: "/views/forms/signUpBegin.html",
            controller: "SignUpBeginForm"
        }],

        PATH_SIGN_UP_COMPLETE: ["/signup/:code", {
            templateUrl: "/views/forms/signUpComplete.html",
            controller: "SignUpCompleteForm"
        }],

        PATH_REG_LETTER_SENT: ["/static/registrationLetterSent", {
            templateUrl: "/views/static/registrationLetterSent.html"
        }],

        PATH_REG_COMPLETE: ["/static/registrationCompleted", {
            templateUrl: "/views/static/registrationCompleted.html"
        }],

        PATH_RECOVER_LETTER_SENT: ["/static/resetLetterSent", {
            templateUrl: "/views/static/resetLetterSent.html"
        }],

        PATH_RECOVER_COMPLETED: ["/static/resetPasswordCompleted", {
            templateUrl: "/views/static/resetPasswordCompleted.html"
        }],

        PATH_PROFILE_HOME: ["/profile/", {
            templateUrl: "/views/auth/profile.html",
            title: "Dashboard on " + SITE_TITLE,
            needsAuth: true
        }],

        PATH_PROFILE_EDIT: ["/profile/edit", {
            templateUrl: "/views/auth/editprofile.html",
            title: "Edit profile details on " + SITE_TITLE,
            needsAuth: true
        }],

        PATH_PROFILE_CHANGE_PASSWORD: ["/profile/password", {
            templateUrl: "/views/auth/change-password.html",
            title: "Change password on " + SITE_TITLE,
            needsAuth: true
        }],

        PATH_PROFILE_CHANGE_PLAN: ["/profile/plan", {
            templateUrl: "/views/auth/change-plan.html",
            title: "Upgrade account on " + SITE_TITLE,
            needsAuth: true
        }],

        PATH_PROFILE_TRACKS: ["/profile/tracks/", {
            templateUrl: "/views/auth/tracks.html",
            title: "Your tracks on " + SITE_TITLE,
            needsAuth: true
        }],

        PATH_UNUSED_TRACKS: ["/profile/tracks/unused", {
            templateUrl: "/views/auth/tracks.html",
            title: "Your unused tracks on " + SITE_TITLE,
            unused: true,
            needsAuth: true
        }],

        PATH_PROFILE_STREAMS: ["/profile/streams/", {
            templateUrl: "/views/auth/streams.html",
            title: "Your radio stations on " + SITE_TITLE,
            needsAuth: true
        }],

        PATH_PROFILE_STREAM: ["/profile/streams/:id", {
            templateUrl: "/views/auth/stream.html",
            needsAuth: true
        }],

        PATH_EDIT_STREAM: ["/profile/edit-stream/:id", {
            templateUrl: "/views/auth/edit-stream.html",
            title: "Edit radio station details on " + SITE_TITLE,
            needsAuth: true
        }],

        PATH_NEW_STREAM: ["/profile/new-stream", {
            templateUrl: "/views/auth/new-stream.html",
            title: "Create new radio station on " + SITE_TITLE,
            needsAuth: true
        }],

        PATH_CATEGORIES_LIST: ["/categories/", {
            templateUrl: "/views/categories.html",
            title: "Radio station categories on " + SITE_TITLE
        }],

        PATH_CATEGORIES_LIST_R: ["/category/", {
            redirectTo: "/categories/"
        }],

        PATH_CH_BY_CATEGORY: ["/category/:id", {
            templateUrl: "/views/catalog/by-category.html",
            controller: "ChannelListCategory",
            resolve: {
                channelsData: ["$channels", "$route", "$location", function ($channels, $route, $location) {
                    var promise = $channels.getCategoryChannels($route.current.params.id);
                    promise.then(function (data) {
                        $route.current.title = htmlEscape(data.category.category_name) + " on " + SITE_TITLE;
                    }, function () {
                        $location.url("/categories/");
                    });
                    return promise;
                }]
            }
        }],

        PATH_CH_BY_TAG: ["/tag/:tag", {
            templateUrl: "/views/catalog/by-tag.html",
            controller: "ChannelListTag",
            resolve: {
                channelsData: ["$channels", "$route", function ($channels, $route) {
                    var promise = $channels.getTagChannels($route.current.params.tag);
                    promise.then(function () {
                        $route.current.title = "Results for tag \"" + htmlEscape($route.current.params.tag) + "\" on " + SITE_TITLE;
                    });
                    return promise;
                }]
            }
        }],

        PATH_CH_BY_SEARCH: ["/search/:query", {
            templateUrl: "/views/catalog/by-search.html",
            controller: "ChannelListSearch",
            resolve: {
                channelsData: ["$channels", "$route", function ($channels, $route) {
                    var promise = $channels.getSearchChannels($route.current.params.query);
                    promise.then(function () {
                        $route.current.title = "Search results for request \"" + htmlEscape($route.current.params.query) + "\" on " + SITE_TITLE;
                    });
                    return promise;
                }]
            }
        }],

        /* Streams Search List */
        PATH_USERS_CATALOG: ["/user/", {
            redirectTo: "/"
        }],

        PATH_STREAMS_USER: ["/user/:key", {
            templateUrl: "/views/catalog/by-user.html",
            controller: "ChannelListUser",
            resolve: {
                channelsData: ["$channels", "$route", "$location", function ($channels, $route, $location) {
                    var promise = $channels.getUserChannels($route.current.params.key);
                    promise.then(function (data) {
                        var title = data.user.name ? data.user.name : data.user.login;
                        $route.current.title = htmlEscape(title) + "'s radio stations on " + SITE_TITLE;
                    }, function () {
                        $location.url("/");
                    });
                    return promise;
                }]
            }
        }],

        PATH_STREAMS_POPULAR: ["/streams/", {
            templateUrl: "/views/catalog/by-popularity.html",
            controller: 'ChannelListPopular',
            title: "Popular radio stations on " + SITE_TITLE,
            resolve: {
                channelsData: ["$channels", function ($channels) {
                    return $channels.getPopularChannels();
                }]
            }
        }],

        PATH_STREAMS_NEW: ["/new/", {
            templateUrl: "/views/catalog/by-new.html",
            controller: 'ChannelListNew',
            title: "New radio stations on " + SITE_TITLE,
            resolve: {
                channelsData: ["$channels", function ($channels) {
                    return $channels.getNewChannels();
                }]
            }
        }],

        PATH_STREAMS_RECENT: ["/recent/", {
            templateUrl: "/views/catalog/by-recent.html",
            controller: 'ChannelListRecent',
            title: "Recently updated radio stations on " + SITE_TITLE,
            resolve: {
                channelsData: ["$channels", function ($channels) {
                    return $channels.getRecentChannels();
                }]
            }
        }],

        PATH_STREAMS_BOOKMARKS: ["/bookmarks/", {
            templateUrl: "/views/catalog/by-bookmarks.html",
            controller: 'ChannelListBookmarks',
            title: "Bookmarked radio stations on " + SITE_TITLE,
            resolve: {
                channelsData: ["$channels", function ($channels) {
                    return $channels.getBookmarkedChannels();
                }]
            }
        }],

        PATH_STREAMS_MY: ["/my/", {
            templateUrl: "/views/catalog/by-me.html",
            controller: 'ChannelListMe',
            resolve: {
                channelsData: ["$channels", "$route", "$location", function ($channels, $route, $location) {
                    var promise = $channels.getMyChannels();
                    promise.then(function (data) {
                        var title = data.user.name ? data.user.name : data.user.login;
                        $route.current.title = htmlEscape(title) + "'s radio stations on " + SITE_TITLE;
                    }, function () {
                        $location.url("/");
                    });
                    return promise;
                }]
            }
        }],

        /* Single Stream View */
        PATH_STREAM: ["/streams/:key", {
            templateUrl: "/views/catalog/single-stream.html",
            controller: "ChannelView",
            resolve: {
                channelData: ["$channels", "$route", "$location", function ($channels, $route, $location) {
                    var promise = $channels.getSingleChannel($route.current.params.key);
                    promise.then(function (data) {
                        $route.current.title = data.channel.name + " on " + SITE_TITLE;
                    }, function () {
                        $location.url("/streams/");
                    });
                    return promise;
                }],
                similarData: ["$channels", "$route", "$location", function ($channels, $route, $location) {
                    return $channels.getSimilarChannels($route.current.params.key);
                }]
            }
        }]

    };

    md.constant("ROUTES", routes);
    md.constant("SETTINGS", settings);
    md.constant("SITE_TITLE", "Radioterio - Your own web radio station");

    md.config([
        '$routeProvider', '$locationProvider', 'ROUTES', 'cfpLoadingBarProvider',
        '$sceDelegateProvider', '$httpProvider',
        function ($routeProvider, $locationProvider, ROUTES, cfpLoadingBarProvider,
                  $sceDelegateProvider, $httpProvider) {

            cfpLoadingBarProvider.includeSpinner = false;
            $locationProvider.html5Mode(true).hashPrefix('!');
            $sceDelegateProvider.resourceUrlWhitelist([
                'self',
                // @todo Get rid
                'http://radioter.io:7778/**'
            ]);

            for (key in ROUTES) {
                if (ROUTES.hasOwnProperty(key)) {
                    $routeProvider.when(ROUTES[key][0], ROUTES[key][1])
                }
            }

            /* Otherwise */
            $routeProvider.otherwise({
                templateUrl: "/views/404.html"
            });

            $httpProvider.defaults.cache = false;


        }]);

    md.run(["$rootScope", "$location", "$route", "$document", "SITE_TITLE", "$analytics", "Response", "$http", '$mixpanel',

        function ($rootScope, $location, $route, $document, SITE_TITLE, $analytics, Response, $http, $mixpanel) {

        $rootScope.lib = {
            countries: [],
            categories: []
        };

        $rootScope.go = function (path) {
            $location.path(path);
        };

        $rootScope.reload = function () {
            Response($http({
                method: "GET",
                url: "/api/v2/getCollection"
            })).onSuccess(function (data) {
                $rootScope.lib = data;
            });
        };

        $rootScope.reload();

        $("a").live("click", function () {
            $analytics.eventTrack('followLink', { category: 'Application', label: this.href });
            if (this.href == $location.absUrl()) {
                $route.reload();
            }
        });

        initHelpers();

        $rootScope.$on("$routeChangeSuccess", function (event, currentRoute) {

            $rootScope.rootClass = currentRoute.rootClass;
            $rootScope.url = $location.url();

            $document.get(0).title = currentRoute.title || SITE_TITLE;

            $mixpanel.track('Page Loaded');

        });

        $rootScope.openedDialogs = 0;

        $rootScope.$on("ngDialog.opened", function () {
            $rootScope.openedDialogs++;
            $rootScope.$apply();
        });

        $rootScope.$on("ngDialog.closed", function () {
            $rootScope.openedDialogs--;
            $rootScope.$apply();
        });


        $rootScope.meta = {
            title: SITE_TITLE,
            image: "",
            url: "",
            description: ""
        };


    }

    ]);

    md.directive("toggle", ["$document", function ($document) {
        return {
            scope: {
                toggle: "="
            },
            link: function ($scope, $element, attrs) {
                $scope.toggle = false;
                $element.on("click", function () {
                    $scope.toggle = !$scope.toggle;
                });
                var callback = function (event) {
                    if (!$element.is(event.target) && $element.find(event.target).length == 0) {
                        $scope.$applyAsync(function () {
                            $scope.toggle = false;
                        });
                    }
                };
                $document.on("click", callback);
                $scope.$on("$destroy", function () {
                    $document.unbind("click", callback);
                });
            }
        }
    }]);


    md.directive('footer', [function () {
        return {
            restrict: 'E',
            templateUrl: '/views/footer.html'
        };
    }]);

    md.directive('tagsList', [function () {
        return {
            restrict: 'A',
            template: '<ul class="taglist"><li ng-repeat="tag in tagsArray"><a href="/tag/{{ tag | escape }}" ng-bind="tag"></a></li></ul>',
            scope: {
                tags: "=tagsList"
            },
            link: function (scope) {
                scope.$watch("tags", function (data) {
                    scope.tagsArray = data.split(",").map(function (el) { return el.trim() });
                });
            }
        }
    }]);

    md.directive('header', [function () {
        return {
            restrict: 'E',
            templateUrl: "/views/blocks/header.html"
        }
    }]);

})();

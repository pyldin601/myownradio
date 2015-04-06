/**
 * Created by Roman on 06.04.15.
 */
(function () {

    var module = angular.module("application");

    module.service("$api", ["$q", "$http", function ($q, $http) {

        function answer(promise) {
            return $q(function (resolve, reject) {
                promise.then(function (response) {
                    if (response.data.code == 1) {
                        resolve(response.data.data);
                    } else {
                        reject(response.data.message);
                    }
                })
            });
        }

        return {
            get: function (url, params) {
                return answer($http.get(url, {
                    params: params
                }));
            },
            put: function (url, params) {
                return answer($http.put(url, null, {
                    params: params
                }));
            },
            delete: function (url, params) {
                return answer($http.delete(url, {
                    params: params
                }));
            },
            post: function (url, post) {
                return answer($http.post(url, post));
            },
            filter: function (arguments) {
                var obj = {};
                for (var key in arguments) if (arguments.hasOwnProperty(key)) {
                    if (typeof arguments[key] != "undefined") {
                        obj[key] = arguments[key];
                    }
                }
                return obj;
            }
        }

    }]);

})();
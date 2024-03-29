/**
 * Created by Roman on 07.04.15.
 */
(function () {

    var api = angular.module("application");

    api.service("$schedule", ["$api", function ($api) {
        return {
            whatsOnChannels: function (channel_ids) {
                return $api.get("/api/v2/schedule/onSelectedChannels", $api.filter({
                    stream_ids: channel_ids
                }));
            },
            nowPlaying: function (channel) {
                return $api.get(`/radio-manager/api/pub/v0/streams/${channel.sid}/current-track`);
            }
        }
    }]);

})();

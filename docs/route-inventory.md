# Route Inventory

This inventory lists direct PHP handlers under `services/backend/application/classes/Framework/Handlers/api`.

Route method support comes from each handler `do*` method.

## Validation API

| Path | Handler |
| --- | --- |
| `/api/check/email` | `api/check/DoEmail.php` |
| `/api/check/login` | `api/check/DoLogin.php` |
| `/api/check/streamPermalink` | `api/check/DoStreamPermalink.php` |
| `/api/check/userPermalink` | `api/check/DoUserPermalink.php` |
| `/api/exists/login` | `api/exists/DoLogin.php` |

## API v2 Base

| Path | Handler |
| --- | --- |
| `/api/v2/avatar` | `api/v2/DoAvatar.php` |
| `/api/v2/bookmark` | `api/v2/DoBookmark.php` |
| `/api/v2/categories` | `api/v2/DoCategories.php` |
| `/api/v2/countries` | `api/v2/DoCountries.php` |
| `/api/v2/getCollection` | `api/v2/DoGetCollection.php` |
| `/api/v2/getLink` | `api/v2/DoGetLink.php` |
| `/api/v2/me` | `api/v2/DoMe.php` |
| `/api/v2/self` | `api/v2/DoSelf.php` |

## API v2 Channels

`channels` is the current catalog namespace.

| Path | Handler |
| --- | --- |
| `/api/v2/channels/all` | `api/v2/channels/DoAll.php` |
| `/api/v2/channels/bookmarks` | `api/v2/channels/DoBookmarks.php` |
| `/api/v2/channels/category` | `api/v2/channels/DoCategory.php` |
| `/api/v2/channels/my` | `api/v2/channels/DoMy.php` |
| `/api/v2/channels/new` | `api/v2/channels/DoNew.php` |
| `/api/v2/channels/one` | `api/v2/channels/DoOne.php` |
| `/api/v2/channels/popular` | `api/v2/channels/DoPopular.php` |
| `/api/v2/channels/random` | `api/v2/channels/DoRandom.php` |
| `/api/v2/channels/recent` | `api/v2/channels/DoRecent.php` |
| `/api/v2/channels/search` | `api/v2/channels/DoSearch.php` |
| `/api/v2/channels/similar` | `api/v2/channels/DoSimilar.php` |
| `/api/v2/channels/suggest` | `api/v2/channels/DoSuggest.php` |
| `/api/v2/channels/tag` | `api/v2/channels/DoTag.php` |
| `/api/v2/channels/user` | `api/v2/channels/DoUser.php` |

## API v2 Legacy Streams

`streams` is legacy channel catalog namespace. Product language still calls these channels.

| Path | Handler |
| --- | --- |
| `/api/v2/streams/getBookmarks` | `api/v2/streams/DoGetBookmarks.php` |
| `/api/v2/streams/getList` | `api/v2/streams/DoGetList.php` |
| `/api/v2/streams/getNowPlaying` | `api/v2/streams/DoGetNowPlaying.php` |
| `/api/v2/streams/getOne` | `api/v2/streams/DoGetOne.php` |
| `/api/v2/streams/getOneWithSimilar` | `api/v2/streams/DoGetOneWithSimilar.php` |
| `/api/v2/streams/getRecent` | `api/v2/streams/DoGetRecent.php` |
| `/api/v2/streams/getSchedule` | `api/v2/streams/DoGetSchedule.php` |
| `/api/v2/streams/getSimilarTo` | `api/v2/streams/DoGetSimilarTo.php` |
| `/api/v2/streams/getStreamsByUser` | `api/v2/streams/DoGetStreamsByUser.php` |

## API v2 Channel Management

`stream` is the owner channel management namespace.

| Path | Handler |
| --- | --- |
| `/api/v2/stream/addTracks` | `api/v2/stream/DoAddTracks.php` |
| `/api/v2/stream/changeCover` | `api/v2/stream/DoChangeCover.php` |
| `/api/v2/stream/create` | `api/v2/stream/DoCreate.php` |
| `/api/v2/stream/delete` | `api/v2/stream/DoDelete.php` |
| `/api/v2/stream/modify` | `api/v2/stream/DoModify.php` |
| `/api/v2/stream/moveTrack` | `api/v2/stream/DoMoveTrack.php` |
| `/api/v2/stream/moveTracksToStream` | `api/v2/stream/DoMoveTracksToStream.php` |
| `/api/v2/stream/removeCover` | `api/v2/stream/DoRemoveCover.php` |
| `/api/v2/stream/removeTracks` | `api/v2/stream/DoRemoveTracks.php` |

`moveTracksToStream` has an empty handler body and must not be used as product behavior.

## API v2 Playback Control

| Path | Handler |
| --- | --- |
| `/api/v2/control/notify` | `api/v2/control/DoNotify.php` |
| `/api/v2/control/optimize` | `api/v2/control/DoOptimize.php` |
| `/api/v2/control/play` | `api/v2/control/DoPlay.php` |
| `/api/v2/control/playNext` | `api/v2/control/DoPlayNext.php` |
| `/api/v2/control/playPrevious` | `api/v2/control/DoPlayPrevious.php` |
| `/api/v2/control/playRandom` | `api/v2/control/DoPlayRandom.php` |
| `/api/v2/control/setCurrentTrack` | `api/v2/control/DoSetCurrentTrack.php` |
| `/api/v2/control/shuffle` | `api/v2/control/DoShuffle.php` |
| `/api/v2/control/stop` | `api/v2/control/DoStop.php` |

## API v2 Schedule and Stats

| Path | Handler |
| --- | --- |
| `/api/v2/schedule/onSelectedChannels` | `api/v2/schedule/DoOnSelectedChannels.php` |
| `/api/v2/schedule/timeLine` | `api/v2/schedule/DoTimeLine.php` |
| `/api/v2/schedule/upcoming` | `api/v2/schedule/DoUpcoming.php` |
| `/api/v2/stats/listeners` | `api/v2/stats/DoListeners.php` |

## API v2 Self

| Path | Handler |
| --- | --- |
| `/api/v2/self/changePassword` | `api/v2/self/DoChangePassword.php` |
| `/api/v2/self/delete` | `api/v2/self/DoDelete.php` |
| `/api/v2/self/options` | `api/v2/self/DoOptions.php` |
| `/api/v2/self/promoCode` | `api/v2/self/DoPromoCode.php` |

## API v2 Tracks

| Path | Handler |
| --- | --- |
| `/api/v2/track/changeColor` | `api/v2/track/DoChangeColor.php` |
| `/api/v2/track/copy` | `api/v2/track/DoCopy.php` |
| `/api/v2/track/delete` | `api/v2/track/DoDelete.php` |
| `/api/v2/track/edit` | `api/v2/track/DoEdit.php` |
| `/api/v2/track/preview` | `api/v2/track/DoPreview.php` |
| `/api/v2/track/upload` | `api/v2/track/DoUpload.php` |
| `/api/v2/tracks/getTrackDetails` | `api/v2/tracks/DoGetTrackDetails.php` |

## API v2 Users

| Path | Handler |
| --- | --- |
| `/api/v2/user/fbLogin` | `api/v2/user/DoFbLogin.php` |
| `/api/v2/user/login` | `api/v2/user/DoLogin.php` |
| `/api/v2/user/passwordResetBegin` | `api/v2/user/DoPasswordResetBegin.php` |
| `/api/v2/user/passwordResetComplete` | `api/v2/user/DoPasswordResetComplete.php` |
| `/api/v2/user/signUpBegin` | `api/v2/user/DoSignUpBegin.php` |
| `/api/v2/user/signUpComplete` | `api/v2/user/DoSignUpComplete.php` |
| `/api/v2/users/getAll` | `api/v2/users/DoGetAll.php` |

## API v3

| Path | Handler |
| --- | --- |
| `/api/v3/acquire` | `api/v3/DoAcquire.php` |
| `/api/v3/payment` | `api/v3/DoPayment.php` |
| `/api/v3/tracks/channel` | `api/v3/tracks/DoChannel.php` |
| `/api/v3/tracks/library` | `api/v3/tracks/DoLibrary.php` |


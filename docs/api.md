# API

## Base Path

Primary JSON API path:

- `/api/v2`

Track listing API also uses:

- `/api/v3/tracks`

Full direct handler inventory:

- [Route inventory](route-inventory.md)

## Response Format

Successful JSON responses use:

```json
{
  "code": 1,
  "message": "OK",
  "data": {}
}
```

Error JSON responses use:

```json
{
  "code": 0,
  "message": "Error message",
  "data": null
}
```

AngularJS API wrapper treats `code === 1` as success.

## Authentication

Authenticated endpoints require `secure_session` cookie.

The cookie stores a JWT object with:

- `id`: browser session id.
- `data`: session data.

Authenticated user lookup reads `data.TOKEN`, then looks up `r_sessions.token`.

## Pagination

Catalog endpoints use:

- `offset`: integer, default `0`.
- `limit`: integer, max `50` for channel list endpoints.

## User API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/v2/user/login` | No | Login by login/email and password. |
| `POST` | `/api/v2/user/fbLogin` | No | Login or register with Facebook token. |
| `POST` | `/api/v2/user/signUpBegin` | No | Send registration email. |
| `POST` | `/api/v2/user/signUpComplete` | No | Create user from registration code. |
| `POST` | `/api/v2/user/passwordResetBegin` | No | Send password reset email. |
| `POST` | `/api/v2/user/passwordResetComplete` | No | Set password from reset code. |
| `GET` | `/api/v2/self` | Yes | Return current user, owned channels, and client id. |
| `POST` | `/api/v2/self` | Yes | Update current user profile. |
| `PUT` | `/api/v2/self` | No | Login and return auth token. |
| `DELETE` | `/api/v2/self` | Yes | Logout. |
| `POST` | `/api/v2/self/changePassword` | Yes | Change current user password. |
| `POST` | `/api/v2/self/delete` | Yes | Delete current user after password check. |
| `GET` | `/api/v2/avatar` | Yes | Get current avatar URL. |
| `POST` | `/api/v2/avatar` | Yes | Upload current avatar. |
| `DELETE` | `/api/v2/avatar` | Yes | Remove current avatar. |

## Channel Catalog API

Catalog endpoints return public channels plus authenticated user's own channels.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v2/channels/all` | No | List channels by creation date. |
| `GET` | `/api/v2/channels/new` | No | List newest channels. |
| `GET` | `/api/v2/channels/popular` | No | List channels by playbacks and listener stats. |
| `GET` | `/api/v2/channels/recent` | No | List recently updated channels. |
| `GET` | `/api/v2/channels/one` | No | Get one channel by id or permalink. |
| `GET` | `/api/v2/channels/category` | No | List channels in category permalink. |
| `GET` | `/api/v2/channels/tag` | No | List channels matching tag. |
| `GET` | `/api/v2/channels/search` | No | Search channels by text query. |
| `GET` | `/api/v2/channels/suggest` | No | Return up to 5 channel suggestions. |
| `GET` | `/api/v2/channels/user` | No | List channels owned by user key. |
| `GET` | `/api/v2/channels/bookmarks` | Yes | List current user's bookmarked channels. |
| `GET` | `/api/v2/channels/my` | Yes | List current user's channels. |
| `GET` | `/api/v2/channels/similar` | No | List channels with similar hashtags. |
| `GET` | `/api/v2/channels/random` | No | Return random playable channel. |

Common channel fields:

- `sid`
- `uid`
- `name`
- `permalink`
- `info`
- `hashtags`
- `access`
- `status`
- `cover`
- `cover_background`
- `created`
- `bookmarks_count`
- `listeners_count`
- `is_featured`
- `playbacks`
- `bookmarked`
- `now_playing`
- `time_left`

## Channel Management API

These endpoints require owner auth.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v2/stream/create` | Create channel. |
| `POST` | `/api/v2/stream/modify` | Update channel metadata. |
| `POST` | `/api/v2/stream/delete` | Delete channel. |
| `POST` | `/api/v2/stream/changeCover` | Upload channel cover. |
| `POST` | `/api/v2/stream/removeCover` | Remove channel cover. |
| `POST` | `/api/v2/stream/addTracks` | Add tracks to channel playlist. |
| `POST` | `/api/v2/stream/removeTracks` | Remove playlist entries. |
| `POST` | `/api/v2/stream/moveTrack` | Move one playlist entry. |

Create and update fields:

- `name`: required.
- `info`: optional.
- `tags`: optional comma-separated hashtags.
- `permalink`: optional.
- `category`: optional category id.
- `access`: optional, default `PUBLIC`.

Playlist fields:

- `stream_id`: channel id.
- `tracks`: comma-separated track ids.
- `up_next`: boolean.
- `unique_ids`: comma-separated playlist entry ids.
- `unique_id`: one playlist entry id.
- `new_index`: target playlist index.

## Playback Control API

These endpoints require owner auth.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v2/control/play` | Start or resume channel. |
| `POST` | `/api/v2/control/stop` | Stop channel. |
| `POST` | `/api/v2/control/playNext` | Skip to next playlist entry. |
| `POST` | `/api/v2/control/playPrevious` | Skip to previous playlist entry. |
| `POST` | `/api/v2/control/playRandom` | Play random playlist entry. |
| `POST` | `/api/v2/control/setCurrentTrack` | Play selected playlist entry. |
| `POST` | `/api/v2/control/shuffle` | Shuffle playlist. |
| `POST` | `/api/v2/control/optimize` | Recompute playlist order/time offsets. |
| `POST` | `/api/v2/control/notify` | Notify streamers for channel. |

Required common field:

- `stream_id`: channel id.

`setCurrentTrack` also requires:

- `unique_id`: playlist entry id.

## Track API

These endpoints require auth unless stated.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/v2/track/upload` | Upload tracks. |
| `POST` | `/api/v2/track/edit` | Edit track metadata. |
| `POST` | `/api/v2/track/delete` | Delete track. |
| `POST` | `/api/v2/track/copy` | Copy track, optionally to channel. |
| `POST` | `/api/v2/track/changeColor` | Set track color group. |
| `GET` | `/api/v2/track/preview` | Stream generated track preview. |
| `GET` | `/api/v2/tracks/getTrackDetails` | Get one playlist track. |
| `GET` | `/api/v3/tracks/library` | List current user's library tracks. |
| `GET` | `/api/v3/tracks/channel` | List tracks attached to a channel. |

Upload fields:

- file list.
- `stream_id`: optional channel id.
- `up_next`: optional boolean.

Edit fields:

- `track_id`: required. Accepts one id or comma-separated ids.
- `artist`
- `title`
- `album`
- `track_number`
- `genre`
- `date`
- `color_id`
- `cue`
- `buy`
- `can_be_shared`

## Lookup API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v2/getCollection` | No | Return countries, categories, color groups, genres, and access modes. |
| `GET` | `/api/v2/categories` | No | Return categories. |
| `GET` | `/api/v2/countries` | No | Return countries. |
| `GET` | `/api/v2/getLink` | No | Return channel link payload. |

## Bookmark API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `PUT` | `/api/v2/bookmark` | Yes | Bookmark channel. |
| `DELETE` | `/api/v2/bookmark` | Yes | Remove bookmark. |

Required field:

- `stream_id`: channel id.

## Schedule API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v2/schedule/timeLine` | No | Return timeline for one channel. |
| `GET` | `/api/v2/schedule/onSelectedChannels` | No | Return now-playing data for selected channels. |
| `GET` | `/api/v2/schedule/upcoming` | No | Return nearest upcoming track change. |

## Stats API

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v2/stats/listeners` | No | Return active listener count. |

## Content Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/content/streamcovers/:fn` | Serve channel cover image. |
| `GET` | `/content/avatars/:fn` | Serve avatar image. |
| `GET` | `/content/audio/&id` | Serve track preview audio. |
| `GET` | `/content/m3u/:stream_id.m3u` | Serve M3U playlist. |
| `GET` | `/content/trackinfo/&id` | Serve extra track info. |
| `GET` | `/getchunk/:id` | Serve playback chunk. |
| `GET` | `/flow` | Serve audio stream flow. |

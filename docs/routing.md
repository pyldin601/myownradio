# Routing

## Direct Routes

Direct routes map URL segments to handler class names.

Rule:

- URL path segment becomes namespace path.
- Last segment becomes class `Do<Segment>`.
- HTTP method maps to controller method `doGet`, `doPost`, `doPut`, or `doDelete`.

Example:

- URL: `/api/v2/channels/all`
- Handler: `Framework\Handlers\api\v2\channels\DoAll`
- Method: `doGet`

Router file:

- `services/backend/application/classes/Framework/Router.php`

## Legacy and UI Routes

Legacy and UI routes use `SubRouter`.

Registered routes:

- `/profile/*` -> dashboard template.
- `/index`, `/streams`, `/bookmarks`, `/login`, `/recover`, `/signup`, `/categories` -> default AngularJS template.
- `/category/:category` -> category helper.
- `/streams/:id` -> channel helper.
- `/user/:id` -> user helper.
- `/search/:query` -> search helper.
- `/subscribe` -> acquire handler.
- `/content/streamcovers/:fn` -> channel cover.
- `/content/avatars/:fn` -> user avatar.
- `/content/audio/&id` -> preview audio.
- `/content/m3u/:stream_id.m3u` -> M3U playlist.
- `/content/trackinfo/&id` -> track extra info.
- `/getchunk/:id` -> current playback chunk.
- `/flow` -> audio stream.

## Route Parameter Syntax

`SubRouter` parameter syntax:

- `:name`: non-slash string.
- `&name`: numeric value.

## 404 Behavior

If no direct route and no sub-route match, backend returns HTTP `404` and renders default template.


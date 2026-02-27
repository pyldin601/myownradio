# Backend Service Project Spec

## Summary
`services/backend` is the core PHP web service for MyOwnRadio. It serves a JSON API (versioned under `/api/v2/`), renders legacy/SPA pages, and ships a frontend AngularJS app plus compiled assets. It runs behind Nginx and PHP-FPM, integrates with MySQL and Redis, and depends on external services like the radio streamer, file server, SMTP, Facebook, and S3.

## Goals
1. Provide authenticated APIs for users, streams, tracks, schedules, and playback control.
2. Serve web pages and SPA routes for the primary web experience.
3. Manage media storage, upload, and delivery metadata.
4. Integrate with the radio streamer service and external providers.

## Non-Goals
1. Realtime pubsub or streaming playback itself. Those are handled by other services.
2. Frontend applications outside of the AngularJS app embedded in this service.

## Architecture Overview
- Runtime: PHP 7.4 (PHP-FPM) + Nginx.
- Web entry point: `services/backend/public/index.php`.
- Routing: custom router in `services/backend/application/classes/Framework/Router.php` plus `SubRouter`.
- Controllers: classes under `services/backend/application/classes/Framework/Handlers/...` implementing `Framework\Controller`.
- Frontend: AngularJS 1.x app in `services/backend/public/js/mor-modules/main.ang.js` plus bundled assets from Webpack.
- Assets: built via Webpack and LESS into `services/backend/public/assets` and `services/backend/public/css`.
- Storage: local storage path configured via env and `services/backend/config/storage.php`.

## Primary Features
1. Authentication and session handling via JWT cookies (`secure_session`) for API access.
2. User management including login, signup, password reset, and profile management.
3. Streams and channels browsing, creation, editing, and playback metadata.
4. Track library and upload workflows with audio metadata support.
5. Scheduled playback and playlist operations.
6. Public content endpoints for avatars, covers, previews, and audio streaming.
7. Web UI routes for discovery, search, profile, and management pages.

## API Design
- Base path: `/api/v2/`.
- Response shape: `{ "code": 1|0, "message": "...", "data": ... }`.
- Authentication: JWT token stored in cookie `secure_session`.
- Errors: standard HTTP status codes with JSON error bodies.
- Pagination: common `offset` and `limit` query parameters.
- Documentation: `services/backend/API.md`.

## Routing Model
- Direct routes map to controller classes. Example path `/api/v2/streams/getList` maps to `Framework\Handlers\api\v2\streams\DoGetList` with method `doGet`.
- SPA and legacy page routes are registered in `Framework\Router::registerSubRoutes()` using `SubRouter` with `:param` or `&param` matchers.
- Route params are accessed via `Framework\Services\HttpGet` or `Framework\Services\RouteParams`.
- Routing spec: `services/backend/spec/routing-handlers.md`.

## Frontend (AngularJS)
- App module defined in `services/backend/public/js/mor-modules/main.ang.js`.
- `ngRoute` is used with HTML5 mode enabled.
- Routes are declared in a single `ROUTES` constant and registered via `$routeProvider`.
- A default 404 template is served for unmatched routes.

## Data and Storage
- MySQL is the primary database, configured in `services/backend/config/database.php`.
- Session handling and storage are configured in `services/backend/config/storage.php`.
- Local storage directory is provided via `BACKEND_STORAGE_LOCAL_DIR`.
- Audio constraints include size, duration, and format limits in `services/backend/config/storage.php`.

## Integrations
- Radio streamer endpoints and token required via env: `RADIO_STREAMER_ENDPOINT`, `RADIO_STREAMER_INTERNAL_ENDPOINT`, `RADIO_STREAMER_TOKEN`.
- Facebook OAuth: `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET`.
- SMTP for transactional email: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_PORT`.
- File server and web server addresses: `FILE_SERVER_OWN_ADDRESS`, `WEB_SERVER_OWN_ADDRESS`.
- Storage backend choice: `STORAGE_BACKEND`.
- Assets manifest URL: `ASSETS_MANIFEST_URL`.
- S3 credentials and settings in `services/backend/config/services.php`.
- FFMPEG is used for audio processing, configured in `services/backend/config/services.php`.

## Configuration
- App settings: `services/backend/config/app.php`.
- Database settings: `services/backend/config/database.php`.
- JWT secret: `services/backend/config/jwt.php`.
- Service integrations: `services/backend/config/services.php`.
- Storage settings: `services/backend/config/storage.php`.

## Build and Development
- PHP dependencies via Composer: `services/backend/composer.json`.
- Frontend dependencies via npm and bower: `services/backend/package.json`.
- Webpack build pipeline: `services/backend/webpack.config.ts`.
- Makefile helper for dev image and composer install: `services/backend/Makefile`.
- Docker build targets: `php-base`, `nginx-base`, `php-devenv` in `services/backend/Dockerfile`.

## Testing
- PHPUnit configuration: `services/backend/phpunit.xml.dist`.
- Tests directory: `services/backend/tests`.

## Operational Notes
- Nginx template rewrites all requests to `index.php` for routing.
- PHP-FPM settings are tuned for high concurrency in Dockerfile.
- Max upload file size is controlled by `MAX_UPLOAD_FILESIZE` build arg and env.

## Key Files
1. `services/backend/public/index.php` entry point and bootstrapping.
2. `services/backend/application/classes/Framework/Router.php` routing and dispatch.
3. `services/backend/application/classes/Framework/Services/SubRouter.php` regex/legacy routing.
4. `services/backend/public/js/mor-modules/main.ang.js` AngularJS routes and app module.
5. `services/backend/API.md` API reference and response format.

## Open Questions
1. What is the authoritative list of endpoints to keep in sync with `services/backend/API.md`.
2. Which storage backends are supported beyond local and S3.
3. Whether the AngularJS app is still the primary web UI or legacy only.

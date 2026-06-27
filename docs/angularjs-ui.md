# AngularJS UI

## Application

AngularJS app module:

- `application`

Main file:

- `services/backend/public/js/mor-modules/main.ang.js`

Site title:

- `Radioterio - Your own web radio station`

API wrapper:

- `services/backend/public/js/mor-modules/api/api.core.js`

The wrapper resolves promises only when JSON response `code` equals `1`.

## Route Mode

AngularJS uses:

- `ngRoute`
- HTML5 mode
- hash prefix `!`

Backend `SubRouter` serves the default template for SPA routes.

## Public Routes

| Route | View | Purpose |
| --- | --- | --- |
| `/` | `/views/home.html` | Home page. |
| `/login/` | `/views/login.html` | Login. |
| `/recover` | `/views/forms/recoverPassword1.html` | Start password reset. |
| `/recover/:code` | `/views/forms/recoverPassword2.html` | Complete password reset. |
| `/signup` | `/views/forms/signUpBegin.html` | Start registration. |
| `/signup/:code` | `/views/forms/signUpComplete.html` | Complete registration. |
| `/categories/` | `/views/categories.html` | Category list. |
| `/category/:id` | `/views/catalog/by-category.html` | Channels by category. |
| `/tag/:tag` | `/views/catalog/by-tag.html` | Channels by tag. |
| `/search/:query` | `/views/catalog/by-search.html` | Channels by search. |
| `/user/:key` | `/views/catalog/by-user.html` | Channels by owner. |
| `/streams/` | `/views/catalog/by-popularity.html` | Popular channels. |
| `/new/` | `/views/catalog/by-new.html` | New channels. |
| `/recent/` | `/views/catalog/by-recent.html` | Recently updated channels. |
| `/streams/:key` | `/views/catalog/single-stream.html` | Channel detail page. |

## Auth Routes

Routes with `needsAuth: true`:

| Route | View | Purpose |
| --- | --- | --- |
| `/profile/` | `/views/auth/profile.html` | Dashboard. |
| `/profile/edit` | `/views/auth/editprofile.html` | Edit profile. |
| `/profile/password` | `/views/auth/change-password.html` | Change password. |
| `/profile/plan` | `/views/auth/change-plan.html` | Change plan. |
| `/profile/tracks/` | `/views/auth/tracks.html` | Track library. |
| `/profile/tracks/unused` | `/views/auth/tracks.html` | Unused tracks. |
| `/profile/streams/` | `/views/auth/streams.html` | Owned channels. |
| `/profile/streams/:id` | `/views/auth/stream.html` | Manage channel playlist and playback. |
| `/profile/edit-stream/:id` | `/views/auth/edit-stream.html` | Edit channel. |
| `/profile/new-stream` | `/views/auth/new-stream.html` | Create channel. |

## Bookmark Route

| Route | View | Purpose |
| --- | --- | --- |
| `/bookmarks/` | `/views/catalog/by-bookmarks.html` | Current user's bookmarked channels. |

## Client API Services

Channel API service:

- `services/backend/public/js/mor-modules/api/api.channels.js`

Track API service:

- `services/backend/public/js/mor-modules/api/api.tracks.js`

Other API service files:

- `api.bookmarks.js`
- `api.categories.js`
- `api.schedule.js`
- `api.streams.js`

## Global Startup

On app run:

- Loads `/api/v2/getCollection`.
- Stores countries, categories, groups, genres, and access modes in `$rootScope.lib`.
- Sets page title from route config.
- Tracks page load with Mixpanel.
- Tracks link clicks with analytics.


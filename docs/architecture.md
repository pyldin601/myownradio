# Architecture

## Scope

This document covers `services/backend`.

`services/backend` is a PHP 7.4 application. It serves:

- JSON API.
- Legacy AngularJS single-page UI.
- Static assets.
- Content endpoints for covers, avatars, audio previews, M3U files, chunks, and audio flow.

## Runtime

Runtime components:

- Nginx routes HTTP requests to PHP-FPM.
- PHP application handles API, pages, and content.
- MySQL stores users, channels, tracks, playlists, sessions, stats, categories, countries, and options.
- Local filesystem stores uploaded media and image files.
- FFMPEG generates audio previews.
- SMTP sends registration and password reset mail.
- Facebook API supports Facebook login.

## Entry Point

HTTP entry point:

- `services/backend/public/index.php`

Router:

- `services/backend/application/classes/Framework/Router.php`

Direct API handler path rule:

- URL `/api/v2/channels/all`
- Handler `Framework\Handlers\api\v2\channels\DoAll`
- File `services/backend/application/classes/Framework/Handlers/api/v2/channels/DoAll.php`

## Layers

Controller layer:

- Files under `services/backend/application/classes/Framework/Handlers`.
- Each controller handles one direct route or one legacy route.

Model layer:

- Files under `services/backend/application/classes/Framework/Models`.
- Handles domain operations for users, channels, tracks, playlist control, and payment.

REST collection layer:

- Files under `services/backend/application/classes/API/REST` and `services/backend/application/classes/REST`.
- Builds API response payloads from database queries.

Object layer:

- Files under `services/backend/application/classes/Objects`.
- Maps DB tables to PHP objects.

Frontend layer:

- AngularJS app in `services/backend/public/js/mor-modules`.
- Main app and route table in `services/backend/public/js/mor-modules/main.ang.js`.

## External Service Boundaries

In scope:

- PHP backend.
- AngularJS UI shipped by PHP backend.

Out of scope:

- Rust streamer.
- Rust radio manager backend.
- Pubsub backend.
- Web egress services.


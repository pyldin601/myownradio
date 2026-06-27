# Open Questions

These questions need product or technical owner decisions.

## Product

1. Should `UNLISTED` channels appear anywhere for unauthenticated users except direct URL access?
2. Should private channels be playable by owner only, or also by invited users?
3. Should public channel listing require `status = 1` and at least one track, as current catalog code does?
4. Should comments remain part of product scope?
5. Are account plans and payments active product features or legacy-only features?
6. Should Facebook login remain supported?

## API

1. Should `/api/v3/tracks/*` be documented as stable API or internal AngularJS API?
2. Should `PUT /api/v2/self` remain supported when `POST /api/v2/user/login` exists?
3. Should all mutation endpoints use `POST`, or should delete/bookmark semantics be normalized?
4. Should response `message` always be `"OK"` on success?

## Data

1. Which tables are deprecated and safe to ignore in new implementation work?
2. Which derived counters are authoritative when table data and counters differ?
3. Should `stream` names in DB/API stay unchanged or migrate to `channel` naming in new code?

## Operations

1. Which storage backend is active in production: local filesystem or S3?
2. Which mail provider is active for registration and password reset?
3. What is the supported PHP version for production?


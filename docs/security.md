# Security

## Sessions

Session cookie:

- name: `secure_session`
- value: JWT signed with `JWT_KEY`
- algorithm: `HS256`
- lifetime: `30 days`
- path: `/`

JWT payload:

- `id`: session id.
- `data`: session data.

Authenticated user resolution:

1. Decode `secure_session`.
2. Read `data.TOKEN`.
3. Find row in `r_sessions` where `token` matches.
4. Load `r_users` by `uid`.

## Authorization

Owner-only operations instantiate `AuthUserModel`.

Owner channel playlist operations verify:

- channel exists.
- authenticated user id equals `r_streams.uid`.

Track edit operations filter by:

- `r_tracks.uid = current_user_id`.

## Public Visibility

Catalog queries show:

- public active channels with tracks.
- authenticated user's own channels.

Anonymous catalog queries show only:

- `access = PUBLIC`.

## Validation

Input validation includes:

- email format.
- unique email.
- login format.
- password format.
- user permalink.
- channel category.
- country id.
- track color.
- track id list.

Validation service:

- `services/backend/application/classes/Framework/Services/InputValidator.php`

## Legal Constraint

Users must own or have legal permission to broadcast uploaded audio.

The service must not imply that upload or playback grants broadcast rights.


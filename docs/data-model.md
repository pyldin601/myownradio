# Data Model

Source migrations live in `migrations/`.

## Core Tables

### `r_users`

Stores user accounts.

Key columns:

- `uid`: primary key.
- `mail`: unique email.
- `login`: unique login.
- `password`: password hash.
- `name`: display name.
- `country_id`: optional country.
- `info`: profile text.
- `registration_date`: Unix timestamp.
- `last_visit_date`: Unix timestamp.
- `permalink`: public user key.
- `avatar`: avatar file name.
- `is_enabled`: account enable flag from later migration.

### `r_streams`

Stores channels.

Key columns:

- `sid`: primary key.
- `uid`: owner user id.
- `name`: channel name.
- `permalink`: optional public key.
- `info`: description.
- `jingle_interval`: jingle interval.
- `status`: playback status, `1` active and `0` inactive.
- `started`: playback start timestamp.
- `started_from`: playlist offset at start.
- `access`: `PUBLIC`, `UNLISTED`, or `PRIVATE`.
- `category`: optional category id.
- `hashtags`: comma-separated tags.
- `cover`: cover file name.
- `cover_background`: cover background color.
- `created`: Unix timestamp.

### `r_tracks`

Stores uploaded tracks.

Key columns:

- `tid`: primary key.
- `file_id`: file storage id.
- `uid`: owner user id.
- `filename`: original file name.
- `hash`: content hash.
- `ext`: extension.
- `artist`
- `title`
- `album`
- `track_number`
- `genre`
- `date`
- `cue`
- `buy`
- `duration`: milliseconds.
- `filesize`: bytes.
- `color`: track color group id.
- `uploaded`: Unix timestamp.
- `copy_of`: source track id for copies.
- `used_count`: number of playlist uses.
- `is_new`
- `can_be_shared`
- `is_deleted`
- `deleted`: deletion timestamp.

### `r_link`

Stores playlist entries for channels.

Key columns:

- `unique_id`: playlist entry id.
- `stream_id`: channel id.
- `track_id`: track id.
- `t_order`: playlist order.
- `time_offset`: track start offset in channel loop.

### `r_static_stream_vars`

Stores derived channel counters.

Examples:

- track count.
- total track duration.
- listener count.
- bookmarks count.
- playbacks.
- featured flag.

### `r_static_user_vars`

Stores derived user counters.

Examples:

- channels count.
- tracks count.
- total tracks duration.
- total tracks size.

## Lookup Tables

- `mor_countries`: country list.
- `r_categories`: channel categories.
- `mor_access`: access modes.
- `r_colors`: track color groups.
- `mor_genres`: genres.
- `opt_valid_lang`: valid languages.
- `opt_valid_format`: valid formats.

## Auth Tables

### `r_sessions`

Stores server-side auth sessions.

Authenticated requests read token from `secure_session` cookie data and match it against `r_sessions.token`.

## Social and User Tables

- `r_bookmarks`: user channel bookmarks.
- `opt_user_options`: per-user options.
- `mor_comment`: channel comments.
- `mor_letter_event`: registration and password reset letter events.

## File Tables

- `fs_file`: stored file records.
- `fs_list`: file server records.

`fs_file.file_extension` is added by migration `1616952718205_initial.up.sql`.

## Plan and Payment Tables

- `mor_limits`
- `mor_plans`
- `mor_payment_order`
- `mor_payments`
- `mor_promo_codes`

These support account plans and promo-code based upgrades.

## Stats Tables

- `r_listener`
- `r_listener_stats`
- `mor_track_stat`
- `r_stats_memory`

## Triggers

Database triggers keep derived counters in sync:

- User insert creates `r_static_user_vars` and `opt_user_options`.
- User delete removes `r_static_user_vars`.
- Channel insert creates `r_static_stream_vars`, increments owner channel count, and updates category count for public channels.
- Channel update adjusts category count when public category changes.
- Channel delete removes static channel vars and decrements owner channel count.
- Track insert updates user track counters and creates `mor_track_stat`.


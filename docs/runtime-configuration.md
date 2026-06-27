# Runtime and Configuration

## Docker Compose

Local compose file:

- `docker-compose.yml`

Relevant backend services:

- `backend-nginx`: Nginx frontend for PHP.
- `backend-php-fpm`: PHP-FPM process.
- `db`: MySQL 8 database.
- `file-server`: serves storage files from `services/backend/.cache/storage`.
- `migration`: applies SQL migrations.

Traefik exposes backend routes on local port `40180`.

## PHP Config Files

- `services/backend/config/app.php`
- `services/backend/config/database.php`
- `services/backend/config/jwt.php`
- `services/backend/config/services.php`
- `services/backend/config/storage.php`

## Required Environment

Database:

- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`

Session signing:

- `JWT_KEY`

Storage:

- `BACKEND_STORAGE_LOCAL_DIR`

Optional integrations:

- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `S3_BUCKET`
- `S3_REGION`
- `FFMPEG_PATH`

## Defaults

Application:

- Timezone: `Europe/Kiev`.
- Debug flag: `APP_DEBUG`, default `false`.

Database:

- Default DB name: `mor`.
- Default DB port: `3306`.
- MySQL charset command: `set names 'utf8'; set session sql_mode='';`.

Session:

- Cookie name: `secure_session`.
- Cookie lifetime: `30 days`.

Audio upload:

- Max duration: `14400000` milliseconds.
- Max file size: `536870912` bytes.
- Supported extensions: `mp3`, `flac`, `aac`, `ogg`, `m4a`, `wav`, `mod`, `xm`, `s3m`, `stm`, `it`.

FFMPEG:

- Default binary: `ffmpeg`.
- Preview output: MP3, 128 kbit/s, stereo, fade-in.


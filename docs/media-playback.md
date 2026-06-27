# Media and Playback

## Upload

Users upload tracks through:

- `POST /api/v2/track/upload`

Accepted audio extensions:

- `mp3`
- `flac`
- `aac`
- `ogg`
- `m4a`
- `wav`
- `mod`
- `xm`
- `s3m`
- `stm`
- `it`

Limits:

- Max file size: `536870912` bytes.
- Max duration: `14400000` milliseconds.

## Track Metadata

Editable metadata:

- artist.
- title.
- album.
- track number.
- genre.
- date.
- cue.
- buy link.
- color group.
- share flag.

## Channel Playlist

Owner can:

- add tracks.
- add tracks as next items.
- remove playlist entries.
- move one playlist entry.
- shuffle playlist.
- optimize playlist.

Playlist entry id is `unique_id`.

## Playback State

Playback state is stored on `r_streams`:

- `status`: active flag.
- `started`: timestamp when playback position was established.
- `started_from`: offset inside playlist loop.

Current position:

```text
(now - started + started_from) % tracks_duration
```

If `status` is `0`, channel has no active playback position.

## Now Playing

Now-playing queries join:

- `r_streams`
- `r_static_stream_vars`
- `r_link`
- `r_tracks`

The current track is the playlist entry where:

```text
time_offset <= current_position
time_offset + duration > current_position
```

## Preview Audio

Preview endpoint:

- `GET /api/v2/track/preview?track_id=:id`

FFMPEG generates MP3 preview output.

## Listener Count

Active listeners are rows in `r_listener` where `finished IS NULL`.

Endpoint:

- `GET /api/v2/stats/listeners`


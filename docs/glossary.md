# Glossary

## Channel

A channel is a radio station created by a user.

Code uses `stream` in many PHP classes, table names, and API parameters. Product docs use `channel`.

Mappings:

- `channel` in docs = `stream` in legacy code.
- `channel_id` in docs = `stream_id` or `sid` in legacy API and DB.
- `channels` API namespace = public channel catalog API.
- `stream` API namespace = owner channel management API.

## Track

A track is an uploaded audio file with editable metadata.

Track metadata includes artist, title, album, track number, genre, date, cue, buy link, color, and sharing flag.

## Playlist

A playlist is the ordered list of tracks attached to one channel.

The playlist loops while channel playback is active.

## Listener

A listener is an active playback client connected to a channel.

## Owner

An owner is the authenticated user who created a channel.

## Access Mode

Channel access mode controls channel visibility:

- `PUBLIC`: visible in public catalog and playable by anyone.
- `UNLISTED`: playable by direct link. Not listed in public catalog.
- `PRIVATE`: visible and playable by owner only.


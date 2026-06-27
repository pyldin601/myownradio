# MyOwnRadio Backend Spec

This spec covers the PHP backend and the AngularJS web UI in `services/backend`.

Out of scope:

- Rust services.
- Node services outside `services/backend`.
- RTMP and web egress.
- New React frontends.
- Mobile frontend.

## Product

MyOwnRadio lets a user create a public web radio channel from uploaded audio tracks.

Core user value:

- A listener can find, open, and listen to public channels.
- A user can create channels, upload tracks, arrange playlists, and start playback.
- A user can browse channels by popularity, recency, category, tag, search query, owner, and bookmarks.
- A user can publish public, unlisted, or private channels.
- A user can bookmark channels.
- A user can manage account profile, password, and avatar.

Legal constraint:

- Users must have rights to broadcast uploaded audio.
- The service does not grant copyright or broadcast rights.

## Documents

- [Glossary](glossary.md)
- [Architecture](architecture.md)
- [Runtime and configuration](runtime-configuration.md)
- [Routing](routing.md)
- [Route inventory](route-inventory.md)
- [API](api.md)
- [Data model](data-model.md)
- [AngularJS UI](angularjs-ui.md)
- [Media and playback](media-playback.md)
- [Security](security.md)
- [Open questions](open-questions.md)

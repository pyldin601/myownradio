# MyOwnRadio Service Spec

## Purpose

MyOwnRadio lets a creator host a virtual internet radio channel on the server.

The creator uploads audio, builds a playlist, starts playback, and shares the channel. The creator does not need to keep a personal computer online after setup.

The service produces a continuous HTTP audio stream. Playback is synchronous: every listener of one channel hears the same channel position at the same server timestamp.

The stream behaves like a broadcast radio station:

- playback runs on the server.
- playback continues when the creator browser is closed.
- new listeners join at the current shared channel position.
- listeners do not control the shared channel position.
- default stream format is MP3 at 256 kbit/s.
- supported stream formats are MP3, AAC ADTS, and Opus.
- MP3 streams provide current-track metadata through ICY metadata.
- listeners can use the web player or an external internet radio player that supports one of the service stream formats.

## Roles

### Listener

A listener opens and hears a channel.

A listener can be anonymous or logged in.

### Creator

A creator is a logged-in user who owns channels and tracks.

A creator uploads tracks, creates channels, arranges playlists, starts playback, invites private listeners, and shares channel links.

### Invited Listener

An invited listener is a logged-in listener granted access to one private channel by that channel creator.

## Core Objects

### Channel

A channel is a server-hosted internet radio station.

Each channel has exactly one creator.

Each active channel has one shared playback position.

### Track

A track is an uploaded audio entity owned by one creator.

A track references one stored audio file.

Multiple tracks can reference the same stored audio file.

### Playlist

A playlist is the ordered list of playlist entries used to produce one channel stream.

Each channel has one playlist.

Playlist playback loops from last entry to first entry.

### Playlist Entry

A playlist entry is one track placement inside a channel playlist.

The same track can appear in a playlist more than once.

### Access Mode

Access mode defines who can find and play a channel.

Allowed values:

- `Public`: visible in discovery and playable by everyone.
- `Unlisted`: playable by direct link and hidden from discovery.
- `Private`: visible and playable only by creator and invited listeners.

## Listener Product Behavior

### Discover Public Channels

A listener can browse public channels by:

- popularity.
- newest.
- recently updated.
- category.
- tag.
- search query.
- creator.
- similar channels.

A public channel appears in discovery only when all conditions are true:

- access mode is `Public`.
- playlist has at least one entry.
- channel playback is active.

Search uses channel name, public link, and tags.

Search results follow public channel discovery rules.

Discovery ordering:

- popularity: total played time descending, then playback count descending.
- newest: channel creation time descending.
- recently updated: last channel playback start time descending.
- category: bookmark count descending, then total played time descending, then playback count descending.
- tag search: tag match score descending, then total played time descending, then active listener count descending, then playback count descending.
- text search: text match score descending, then total played time descending, then active listener count descending, then playback count descending.
- creator channels: channel creation time descending.
- similar channels: matching tags, excluding opened channel, max 10 results.

### Open Channel

A listener can open a channel by channel id or public link.

Opening an active public channel shows listener view.

Opening an active unlisted channel by direct link shows listener view.

Opening an active private channel shows listener view only to creator and invited listeners.

Opening a stopped public channel shows listener view with playback state `offline`.

Opening a stopped unlisted channel by direct link shows listener view with playback state `offline`.

Opening a stopped private channel shows listener view with playback state `offline` only to creator and invited listeners.

Opening a missing channel returns `channel_not_found`.

Opening a channel blocked by access mode returns `channel_forbidden`.

### View Channel Information

Listener view shows:

- channel name.
- channel description.
- creator display name.
- cover image.
- tags.
- playback state: `online` or `offline`.
- current track title.
- current track artist.
- time left in current track.
- similar channels.

If current track artist is empty, artist value is empty string.

If current track title is empty, title value is empty string.

If channel is offline, current track fields are null and time left is null.

If no similar channels exist, similar channels list is empty.

### Listen to Channel

A listener starts local playback from listener view.

Local playback connects to channel HTTP audio stream.

When listener connects:

- audio starts at channel current shared position.
- audio continues until listener disconnects, channel stops, or audio delivery fails.
- listener pause affects only listener client.
- listener seek does not change channel shared position.

If channel is offline, playback request returns `channel_inactive`.

If audio delivery fails, listener playback stops and listener view shows `playback_failed`.

Listener must start playback again to reconnect after playback failure.

### Use External Player

A listener can open a channel stream in an external internet radio player that supports one service stream format.

MP3 stream exposes ICY metadata when external player requests ICY metadata.

### Receive Current-Track Metadata

When ICY metadata is enabled by client, MP3 stream sends current-track metadata.

Metadata value changes when channel current track changes.

If current track artist and title are both empty, metadata value is empty string.

### Bookmark Channel

A logged-in listener can bookmark a channel.

A logged-in listener can remove a bookmark.

A logged-in listener can list bookmarked channels.

Bookmarks do not change playback.

### Private Channel Invitation

A logged-in listener can open and listen to a private channel after that channel creator invites the listener.

Removing invitation removes listener access to the private channel.

## Creator Product Behavior

### Create Account

A creator registers with:

- email.
- login.
- password.
- display name.

Registration requires email confirmation.

### Log In and Log Out

A creator logs in with login or email and password.

A creator logs out.

### Reset Password

A creator requests password reset with login or email.

Password reset requires valid one-time reset code.

### Manage Profile

A creator edits:

- display name.
- profile text.
- public profile link.
- country.
- avatar.

A creator deletes account after password confirmation.

Deleting account removes creator-owned channels and tracks.

### Upload Tracks

A creator uploads one or more audio files.

Accepted upload formats:

- MP3.
- FLAC.
- AAC.
- OGG.
- M4A.
- WAV.
- MOD.
- XM.
- S3M.
- STM.
- IT.

Upload limits:

- max file size: 536870912 bytes.
- max duration: 14400000 milliseconds.

Each accepted file creates one track in creator library.

Rejected files create no tracks.

If uploaded audio content matches existing stored file hash, service creates a new track entity and reuses existing stored file.

If uploaded audio content does not match existing stored file hash, service stores file and creates a track entity that references it.

### Manage Track Library

A creator lists all owned tracks.

A creator lists unused tracks.

Unused track means track is not present in any creator-owned channel playlist.

A creator edits track metadata:

- artist.
- title.
- album.
- track number.
- genre.
- release date.
- cue data.
- buy link.
- color group.
- sharing permission.

A creator deletes owned tracks.

Deleting track removes it from all creator-owned playlists.

### Create Channel

A creator creates a channel.

Required field:

- name.

Optional fields:

- description.
- tags.
- public link.
- category.
- cover image.
- access mode.

Default access mode is `Public`.

New channel has empty playlist and playback state `offline`.

### Edit Channel

A creator edits owned channel fields.

A creator replaces or removes cover image.

A creator changes access mode.

A creator invites logged-in listeners to an owned private channel.

A creator removes invited listeners from an owned private channel.

### Delete Channel

A creator deletes an owned channel.

Deleting channel removes:

- channel playlist.
- channel playback state.
- channel bookmarks.
- channel invitations.

Deleting channel does not delete source tracks from creator library.

### Build Playlist

A creator adds owned tracks to owned channel playlist.

A creator adds tracks to playlist end.

A creator adds tracks immediately after current track.

A creator removes playlist entries.

A creator moves one playlist entry to another position.

A creator shuffles playlist entries.

Removing playlist entry does not delete source track.

### Start Channel Playback

A creator starts playback for an owned channel.

Start is allowed only when channel playlist has at least one entry.

After start:

- channel playback state becomes `online`.
- channel has one shared playback position.
- public channel listeners can connect when access mode is `Public`.
- direct-link listeners can connect when access mode is `Unlisted`.
- creator and invited listeners can connect when access mode is `Private`.
- playback continues on server without creator browser.

### Stop Channel Playback

A creator stops playback for an owned channel.

After stop:

- channel playback state becomes `offline`.
- channel has no current track.
- existing listener stream connections close.
- new listener stream connections return `channel_inactive`.
- public channel is removed from public discovery.

### Resume Channel Playback

A creator resumes a stopped owned channel.

Resume starts from first playlist entry.

### Control Active Playback

A creator changes active playback for an owned channel:

- play next playlist entry.
- play previous playlist entry.
- play random playlist entry.
- play selected playlist entry.

Changing active playback changes shared position for all listeners.

### Share Channel

A creator shares:

- channel page link.
- channel stream link.
- channel playlist file link.

Shared links obey channel access mode.

Private channel shared links require invited listener access.

## Shared Playback Rules

### Server-Side Playback

Server is audio source.

Creator browser is control client.

Listener browser is playback client.

### Shared Position

Each active channel has one shared playback position.

Service does not create separate playlist position per listener.

All listeners of one channel resolve to same current track for same server timestamp.

### Current Track Calculation

Service computes current track from:

- current server time.
- channel start time.
- channel start offset.
- playlist entry order.
- playlist entry durations.

When playback reaches playlist end, playback continues from first playlist entry.

### Schedule Data

Schedule data contains:

- current track.
- upcoming track changes.
- channel timeline.
- now-playing data for selected channels.

Timeline width is 3600000 milliseconds.

Upcoming track changes are ordered by least time left in current track.

## Stream Formats

Supported stream formats:

- MP3: `audio/mpeg`.
- AAC ADTS: `audio/aac`.
- Opus: `audio/opus`.

Supported MP3 bitrates:

- 128 kbit/s.
- 192 kbit/s.
- 256 kbit/s.
- 320 kbit/s.

Supported AAC ADTS bitrates:

- 24 kbit/s.
- 32 kbit/s.
- 64 kbit/s.
- 96 kbit/s.
- 128 kbit/s.

Supported Opus bitrates:

- 96 kbit/s.
- 128 kbit/s.
- 256 kbit/s.

## Static Catalog Data

Service provides catalog data used by clients:

- countries.
- categories.
- track color groups.
- genres.
- access modes.

## Stats

Service tracks:

- active listener count.
- channel playbacks.
- channel bookmarks count.
- channel listeners count.
- creator channel count.
- creator track count.
- creator total track duration.
- creator total track size.

Derived counters match records that create them:

- active listener count equals connected listener sessions without finished time.
- channel bookmark count equals bookmark records for channel.
- creator channel count equals channels owned by creator.
- creator track count equals non-deleted tracks owned by creator.
- creator total track duration equals sum of durations for non-deleted tracks owned by creator.
- creator total track size equals sum of file sizes for non-deleted tracks owned by creator.

## Input Constraints

All user-provided text is trimmed before validation.

Empty text after trimming counts as missing input.

Service rejects input that does not match constraints below.

Validation errors identify invalid field.

### Email

Email must:

- contain one `@`.
- contain a domain with suffix.
- be unique during registration.

### Password

Password input is trimmed before validation and storage.

Password must:

- be at least 6 characters.
- be at most 32 characters.

### Login

Login must:

- be at least 3 characters.
- be at most 32 characters.
- contain only lowercase letters, digits, and `_`.
- be unique.

### Text Fields

Display name must be at most 32 characters.

Profile text must be at most 4096 characters.

Channel description must be at most 4096 characters.

Track metadata text fields must be at most 4096 characters each.

Search query must be at most 4096 characters.

### Public Link

Public link must:

- be non-empty when provided.
- contain only lowercase letters, digits, and `-`.
- be unique within its resource type.
- not conflict with numeric resource id.

Creator public links and channel public links are separate resource types.

### Identifier List

Identifier list must:

- contain only positive numeric ids.
- separate ids with `,`.
- not contain spaces.
- not contain empty items.

Valid example:

```text
1,2,3
```

Invalid examples:

```text
1, 2
1,,2
a,2
```

### Pagination

Pagination input must:

- use integer `offset`.
- use integer `limit`.
- treat missing `offset` as `0`.
- reject negative values.
- cap list size to maximum values listed below.

Channel list size must not exceed 50 items per request.

Channel suggestions must not exceed 5 items per request.

Similar channels must not exceed 10 items per request.

### Boolean

Boolean values must be submitted as `true` or `false`.

Service rejects `1`, `0`, `"true"`, `"false"`, empty string, and null for boolean fields.

### Image File

Image file input must:

- be present when image upload is requested.
- have image MIME type.
- be rejected if MIME type is not image.

### Audio File

Audio file input must:

- be present when track upload is requested.
- use accepted upload format.
- not exceed 536870912 bytes.
- not exceed 14400000 milliseconds duration.

### Registration

Registration start requires:

- email.

Registration completion requires:

- confirmation code.
- login.
- password.

Registration completion accepts:

- display name.
- profile text.
- public profile link.
- country.

Country must exist when provided.

Confirmation code must match email confirmation request.

### Login

Login requires:

- login or email.
- password.

### Password Reset

Password reset start requires:

- login or email.

Password reset completion requires:

- reset code.
- new password.

Reset code must be unused and match password reset request.

### Profile

Profile edit requires:

- display name.

Profile edit accepts:

- profile text.
- public profile link.
- country.

Country must exist when provided.

Avatar upload requires:

- image file.

Account deletion requires:

- current password.

### Channel

Channel creation requires:

- channel name.

Channel name must:

- be at least 3 characters.
- be at most 32 characters.
- not contain blocked words.

Blocked words:

- `shit`
- `fuck`
- `ass`
- `хуй`
- `хуя`
- `пизда`
- `влагалище`
- `говно`
- `жопа`
- `писька`

Channel creation accepts:

- description.
- tags.
- public link.
- category.
- cover image.
- access mode.

Channel edit uses same constraints as channel creation.

Category must exist when provided.

Access mode must be one of:

- `Public`.
- `Unlisted`.
- `Private`.

Cover upload requires:

- image file.

### Tags

Tags must:

- be text labels.
- not be empty after trimming.
- be separated by comma when multiple tags are submitted in one text field.

### Track Upload

Track upload requires:

- at least one audio file.

Track upload accepts:

- target channel.
- add-as-next flag.

Target channel must be owned by creator when provided.

### Track Metadata

Track edit requires:

- one track id or identifier list.

Track edit accepts:

- artist.
- title.
- album.
- track number.
- genre.
- release date.
- cue data.
- buy link.
- color group.
- sharing permission.

Every target track must be owned by creator.

Color group must exist when provided.

### Playlist

Add tracks requires:

- channel id.
- identifier list of track ids.

Remove tracks requires:

- channel id.
- identifier list of playlist entry ids.

Move track requires:

- channel id.
- playlist entry id.
- target index.

Every target track must be owned by channel creator.

Every target playlist entry must belong to channel.

Target index must be integer inside resulting playlist bounds.

Target index is 1-based.

Minimum target index is 1.

Maximum target index is playlist entry count after move.

### Playback Control

Playback control requires:

- channel id.

Select-track playback requires:

- playlist entry id.

Channel must be owned by requesting creator.

Selected playlist entry must belong to channel.

### Discovery

Search query must:

- be non-empty after trimming.
- contain no control characters.

Category browse requires:

- existing category identifier or category public link.

Tag browse requires:

- non-empty tag.

Creator browse requires:

- existing creator id or creator public link.

Similar-channel lookup requires:

- existing channel id or channel public link.

### Invitation

Inviting listener requires:

- channel id.
- listener id or listener public link.

Channel must be owned by requesting creator.

Listener must be registered user.

Removing invited listener requires:

- channel id.
- listener id or listener public link.

## Authorization

Anonymous listeners can:

- browse public channels.
- search public channels.
- open public channels.
- open unlisted channels by direct link.
- listen to playable public and unlisted channels.

Logged-in listeners can also:

- bookmark channels.
- remove bookmarks.
- list bookmarks.
- open private channels they were invited to.
- listen to private channels they were invited to.

Creators can:

- create channels.
- edit owned channels.
- delete owned channels.
- upload tracks.
- edit owned tracks.
- delete owned tracks.
- manage owned playlists.
- control owned channel playback.
- invite listeners to owned private channels.
- remove listeners from owned private channels.
- edit profile.
- delete account.

Creators cannot edit channels, tracks, playlists, invitations, or playback state owned by another creator.

## Errors

Service returns structured error for failed operation.

Every error includes:

- non-empty ASCII `snake_case` error code.
- human-readable message.

Service does not expose secrets in errors.

## Legal

Creators must own or have permission to broadcast uploaded audio.

Service does not imply that uploading track grants broadcast rights.

Service shows or provides access to this constraint before public channel use.

## Open Decisions

1. Define exact password complexity beyond length.
2. Define invite flow: user search, email, direct username, or generated link.
3. Define max item count for non-channel paginated lists.
4. Define whether ICY metadata is mandatory for AAC ADTS and Opus streams.

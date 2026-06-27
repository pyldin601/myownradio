# MyOwnRadio Service Spec

## Purpose

MyOwnRadio lets a person create an online radio channel from uploaded audio tracks.

The service gives channel owners tools to upload tracks, arrange playback, publish a channel, and manage channel identity.

The service gives listeners tools to discover, open, and listen to public channels.

## Terms

### User

A user is a registered account holder.

### Channel

A channel is an online radio station owned by one user.

### Track

A track is an audio file uploaded by a user.

### Playlist

A playlist is the ordered list of tracks attached to one channel.

### Listener

A listener is a person or client receiving channel audio.

### Owner

An owner is the user who created a channel.

### Access Mode

Access mode defines who can find or listen to a channel.

Supported access modes:

- `Public`: listed in discovery and playable by everyone.
- `Unlisted`: playable by direct link and not listed in discovery.
- `Private`: visible and playable only by owner.

## Input Constraints

All user-provided text must be trimmed before validation.

Empty text after trimming counts as missing input.

The service must reject input that does not match the constraints below.

Validation errors must identify the invalid field.

### Common Field Types

#### Email

Email must:

- contain one `@`.
- contain a domain with a suffix.
- be unique across users during registration.

#### Password

Password must:

- be at least 6 characters.
- be at most 32 characters.

#### Login

Login must:

- be at least 3 characters.
- be at most 32 characters.
- contain only lowercase letters, digits, and `_`.
- be unique across users.

#### Display Name

Display name must be at most 32 characters.

#### Public Link

Public link must:

- be non-empty when provided.
- contain only lowercase letters, digits, and `-`.
- be unique within its resource type.
- not conflict with a numeric resource id.

User public links and channel public links are separate resource types.

#### Identifier List

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

#### Pagination

Pagination input must:

- use integer `offset`.
- use integer `limit`.
- treat missing `offset` as `0`.
- reject negative values.
- cap list size to the maximum defined for that list.

Channel list size must not exceed 50 items per request.

#### Boolean

Boolean input must accept only explicit boolean values.

String values such as `true`, `false`, `1`, and `0` may be accepted only when the client contract defines them for that field.

#### Image File

Image file input must:

- be present when image upload is requested.
- have an image MIME type.
- be rejected if the MIME type is not image.

#### Audio File

Audio file input must:

- be present when track upload is requested.
- use an accepted audio format.
- not exceed 536870912 bytes.
- not exceed 14400000 milliseconds duration.

### Registration Inputs

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

Confirmation code must be valid and must match the email confirmation request.

### Login Inputs

Login requires:

- login or email.
- password.

### Password Reset Inputs

Password reset start requires:

- login or email.

Password reset completion requires:

- reset code.
- new password.

Reset code must be valid and unused.

### Profile Inputs

Profile edit requires:

- display name.

Profile edit accepts:

- profile text.
- public profile link.
- country.

Country must exist when provided.

Avatar upload requires:

- image file.

Account removal requires:

- current password.

### Channel Inputs

Channel creation requires:

- channel name.

Channel name must:

- be at least 3 characters.
- be at most 32 characters.
- not contain blocked words.

Channel creation accepts:

- description.
- tags.
- public link.
- category.
- cover image.
- access mode.

Channel edit uses the same constraints as channel creation.

Category must exist when provided.

Access mode must be one of:

- `Public`.
- `Unlisted`.
- `Private`.

Cover upload requires:

- image file.

### Tag Inputs

Tags must:

- be text labels.
- not be empty after trimming.
- be separated by comma when multiple tags are submitted in one text field.

### Track Upload Inputs

Track upload requires:

- at least one audio file.

Track upload accepts:

- target channel.
- add-as-next flag.

Target channel must be owned by the uploading user when provided.

### Track Metadata Inputs

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

Every target track must be owned by the editing user.

Color group must exist when provided.

### Playlist Inputs

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

Every target track must be owned by the channel owner.

Every target playlist entry must belong to the channel.

Target index must be an integer inside the resulting playlist bounds.

### Playback Inputs

Playback control requires:

- channel id.

Select-track playback requires:

- playlist entry id.

The channel must be owned by the requesting user.

The selected playlist entry must belong to the channel.

### Discovery Inputs

Search query must:

- be non-empty after trimming.
- contain no control characters.

Category browse requires:

- existing category identifier or category public link.

Tag browse requires:

- non-empty tag.

Owner browse requires:

- existing owner id or owner public link.

Similar-channel lookup requires:

- existing channel id or channel public link.

## Users

### Registration

A person can create an account with email, login, password, display name, and optional profile details.

Registration uses email confirmation.

### Login

A user can log in with login or email and password.

A user can log out.

### Password Reset

A user can request a password reset by login or email.

Password reset uses a one-time reset code sent by email.

### Profile

A user can edit:

- display name.
- profile text.
- public profile link.
- country.
- avatar.

### Account Removal

A user can delete the account after password confirmation.

Account deletion removes user-owned channels and tracks.

## Channels

### Channel Creation

A user can create a channel.

Required channel field:

- name.

Optional channel fields:

- description.
- tags.
- public link.
- category.
- cover image.
- access mode.

Default access mode is `Public`.

### Channel Editing

An owner can edit channel fields after creation.

An owner can replace or remove the cover image.

### Channel Deletion

An owner can delete a channel.

Channel deletion removes its playlist and channel-specific playback state.

### Channel Visibility

Public discovery must show only channels that meet all conditions:

- access mode is `Public`.
- channel has at least one track.
- channel playback is active.

Authenticated owners can see their own channels regardless of public discovery eligibility.

### Channel Discovery

Listeners can browse channels by:

- popularity.
- newest.
- recently updated.
- category.
- tag.
- search query.
- owner.
- bookmarks.
- similar channels.

Listeners can open one channel by channel id or public link.

The service can suggest channels for a search query.

The service can return one random playable channel.

### Channel Category

A category groups public channels by topic.

A channel can have zero or one category.

### Channel Tags

Tags describe channel content.

Tags support search, tag browsing, and similar-channel discovery.

## Tracks

### Upload

A user can upload audio tracks.

Accepted audio formats:

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

### Track Metadata

A user can edit track metadata:

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

### Track Library

A user has a track library.

The track library contains uploaded tracks that are not deleted.

A user can view all library tracks.

A user can view unused tracks.

Unused tracks are tracks not present in any channel playlist.

### Track Deletion

A user can delete owned tracks.

Deleting a track removes it from all owner playlists.

### Track Copy

A user can copy a track.

A user can copy a track directly into a channel playlist.

## Playlists

### Add Tracks

An owner can add one or more owned tracks to a channel playlist.

An owner can add tracks to the end of the playlist.

An owner can add tracks as next items after the current track.

### Remove Tracks

An owner can remove one or more playlist entries.

Removing a playlist entry does not delete the source track from the library.

### Move Track

An owner can move one playlist entry to another playlist position.

### Shuffle

An owner can shuffle channel playlist order.

### Optimize

An owner can rebuild playlist timing data.

Optimization must keep the same playlist entries.

### Playlist Loop

Channel playback loops over the playlist.

When playback reaches the end, it continues from the first playlist entry.

## Playback

### Start

An owner can start channel playback.

If a channel has no tracks, playback must not start.

### Stop

An owner can stop channel playback.

A stopped channel has no active current track.

### Resume

An owner can resume channel playback.

Resume continues from the stored channel position.

### Skip

An owner can skip to:

- next playlist entry.
- previous playlist entry.
- random playlist entry.
- selected playlist entry.

### Current Track

The service must compute current track from:

- current time.
- channel start time.
- channel start offset.
- playlist entry durations.

### Schedule

The service can provide:

- current track.
- upcoming track changes.
- channel timeline.
- now-playing data for selected channels.

## Listening

### Listen

A listener can play channel audio from a playable channel.

Playable channel rules:

- public channel: any listener.
- unlisted channel: any listener with direct link.
- private channel: owner only.

### Metadata

A listener can see:

- channel name.
- channel description.
- owner.
- cover image.
- tags.
- current track.
- time left in current track.
- similar channels.

### Playlist File

A listener can download or open a playlist file for a channel.

## Bookmarks

A logged-in user can bookmark a channel.

A logged-in user can remove a bookmark.

A logged-in user can list bookmarked channels.

Bookmarks must not change channel playback.

## Search

Search uses channel text fields:

- name.
- public link.
- tags.

Search returns channels matching query text.

Search results must follow channel visibility rules.

## Static Catalog Data

The service provides catalog data required by UI clients:

- countries.
- categories.
- track color groups.
- genres.
- access modes.

## Notifications

The service emits events when channel or playlist state changes.

Events include:

- channel deleted.
- channel playback state changed.
- playlist order changed.
- bookmark added.
- bookmark removed.

Notifications must not be required for correctness. Stored state is authoritative.

## Stats

The service tracks:

- active listener count.
- channel playbacks.
- channel bookmarks count.
- channel listeners count.
- user channel count.
- user track count.
- user total track duration.
- user total track size.

Derived counters must match source data after create, update, and delete operations.

## Authorization

Only authenticated users can:

- create channels.
- edit owned channels.
- delete owned channels.
- upload tracks.
- edit owned tracks.
- delete owned tracks.
- manage owned playlists.
- control owned channel playback.
- bookmark channels.
- edit profile.
- delete account.

Anonymous users can:

- browse public channels.
- search public channels.
- open public channels.
- open unlisted channels by direct link.
- listen to playable public and unlisted channels.

## Error Handling

The service returns a structured error for failed operations.

Every error includes:

- stable error code.
- human-readable message.

The service must not expose secrets in errors.

## Legal

Users must own or have permission to broadcast uploaded audio.

The service must not imply that uploading a track grants broadcast rights.

The service must show or provide access to this constraint before public channel use.

## Open Decisions

1. Define exact password rules.
2. Define whether comments remain part of product.
3. Define whether account plans and payments remain part of product.
4. Define whether social login remains part of product.
5. Define whether private channels support invited listeners.
6. Define whether stopped public channels should remain visible outside discovery.
7. Define max length for profile text.
8. Define max length for channel description.
9. Define max length for track metadata text fields.
10. Define max length for search query.
11. Define max item count for non-channel paginated lists.

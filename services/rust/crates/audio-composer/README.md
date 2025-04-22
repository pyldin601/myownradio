# audio-composer

## Overview

`audio-composer` is a service that generates a continuous audio stream by following the real-time schedule of a radio
channel. It relies on an external source that tells it exactly what track is playing at any given moment.

## Endpoints

### `GET /stream/:channelId`

Returns the composed audio stream in real time. This endpoint produces a raw audio stream, continuously generated from
the channel’s playlist.

#### Parameters

- `channelId` — Identifier for the radio channel to stream.

#### Example Usage

```bash
ffplay -nodisp http://localhost:8080/stream/1000
```

### `POST /stream/:channelId/restart`

Triggers a restart of the composing loop for a specific radio channel.
This is used when a user modifies a channel's playlist and needs the composing loop to restart in order to apply the
updated content.

#### Parameters

- `channelId` — Identifier for the radio channel whose stream should be restarted.

#### Example

```bash
curl -X POST http://localhost:8080/stream/1000/restart
```

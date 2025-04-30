# audio-composer

## Overview

`audio-composer` is a service that generates a continuous audio stream by following the real-time schedule of a radio
channel. It relies on an external source that tells it exactly what track is playing at any given moment.

## Endpoints

### `GET /stream/:channelId/get-audio?ts=1746055098`

Returns the composed audio stream in real time. This endpoint produces a raw audio stream, continuously generated from
the channel’s playlist.

#### Parameters

- `channelId` — Identifier for the radio channel to stream.

#### Example Usage

```bash
ffplay -nodisp -f s16le -ar 48000 -ch_layout stereo http://localhost:8080/channel/501/get-audio?ts=1745780368&pre=5000
```

# Components Map

Implemented Next.js components and route handlers in this service. This map reflects current code only; the broader migration target remains in `docs/component-tree.md`.

## Route Map

| URL | Next file | Route component | Main children | Data/API |
| --- | --- | --- | --- | --- |
| `/` | `app/(home)/page.tsx` | `HomeRoute` | `Translate`, legacy hero/action markup | none |
| `/search/[query]` | `app/(app)/search/[query]/page.tsx` | `SearchPage` | search result catalog markup | `GET https://radioter.io/api/v2/channels/search?query=...` |
| `/streams/[id]` | `app/(app)/streams/[id]/page.tsx` | `StreamPage` | `ChannelTools`, `BookmarkToggle`, `PlayerToggle`, `TimelineWidget`, `TagList`, `SimilarStreams` | `/api/v2/channels/one`, `/api/v2/channels/similar`, `/api/v2/self`, `/api/v2/streams/getSchedule` |

## Layout Map

| Scope | Next file | Component | Children | Notes |
| --- | --- | --- | --- | --- |
| home routes | `app/(home)/layout.tsx` | `HomeLayout` | `AppShell` | Sets legacy home/body metadata and CSS shell. |
| app routes | `app/(app)/layout.tsx` | `AppLayout` | `AppShell` | Sets standard app/body shell. |
| all visible routes | `components/layout/app-shell.tsx` | `AppShell` | `BusyOverlay`, `Header`, `MainContent`, `Footer` | Mirrors legacy global shell. |
| shell header | `components/layout/header.tsx` | `Header` | `Translate`, `HeaderSearchForm` | Legacy logo, auth links, stations/categories nav. |
| shell body | `components/layout/main-content.tsx` | `MainContent` | route children | Wraps route content in legacy `#contents/#body`. |
| shell footer | `components/layout/footer.tsx` | `Footer` | links | Legacy footer links. |
| shell loader | `components/layout/busy-overlay.tsx` | `BusyOverlay` | spinner markup | Static hidden legacy loader shell. |

## Component Map

| Component | File | Type | Parent routes/components | State | External effects |
| --- | --- | --- | --- | --- | --- |
| `Translate` | `components/legacy/translate.tsx` | server/client-safe presentational | `Header`, `HomeRoute` | none | none |
| `HeaderSearchForm` | `components/layout/header-search-form.tsx` | client | `Header` | `filter`, `focused`, `streams`, `selectedIndex` | fetches `/api/v2/channels/suggest`; navigates to `/search/[query]` or `/streams/[id]` |
| `MainNavigation` | `components/layout/main-navigation.tsx` | server presentational | future profile/library routes | none | none |
| `ChannelTools` | `components/stream/channel-tools.tsx` | client | `StreamPage` | `settingsOpen`, `activeFormat` | reads/writes `localStorage["mor.defaults.format"]`; links to edit/tracklist/m3u |
| `BookmarkToggle` | `components/stream/bookmark-toggle.tsx` | client | `StreamPage` | `bookmarked`, `count`, `pending` | calls bookmark add/remove APIs |
| `PlayerToggle` | `components/stream/player-toggle.tsx` | client | `StreamPage` | `playing`; module-level shared audio/current sid | creates hidden `Audio`; plays `/flow?s=<sid>&f=<format>`; restarts on ended/error |
| `TimelineWidget` | `components/stream/timeline-widget.tsx` | client | `StreamPage` | `schedule`, `containerWidth`; timer refs | fetches `/api/v2/streams/getSchedule?stream_id=<sid>` with sid only; draws canvas ticks; renders track blocks |
| `TagList` | `components/stream/tag-list.tsx` | server presentational | `StreamPage`, `SimilarStreams` | none | links to `/tag/[tag]` |
| `SimilarStreams` | `components/stream/similar-streams.tsx` | server presentational | `StreamPage` | none | renders backend cover URLs |

## API And Proxy Map

| Local path | File | Method | Upstream | Purpose |
| --- | --- | --- | --- | --- |
| `/api/v2/channels/suggest` | `app/api/v2/channels/suggest/route.ts` | `GET` | `https://radioter.io/api/v2/channels/suggest` | Same-origin search suggestions for header. |
| `/api/v2/self` | `app/api/v2/self/route.ts` | `GET` | `https://radioter.io/api/v2/self` | Account lookup; forwards cookies. |
| `/api/v2/streams/getOneWithSimilar` | `app/api/v2/streams/getOneWithSimilar/route.ts` | `GET` | `https://radioter.io/api/v2/streams/getOneWithSimilar` | Legacy compatibility proxy. |
| `/api/v2/streams/getSchedule` | `app/api/v2/streams/getSchedule/route.ts` | `GET` | `https://radioter.io/api/v2/streams/getSchedule` | Timeline schedule proxy; expects numeric `stream_id`/sid. |
| `/flow` | `app/flow/route.ts` | `GET` | `https://radioter.io/flow` | Audio playback redirect for listener stream. |

## Stream Page Data Flow

1. `StreamPage` resolves URL id as number or permalink.
2. Server fetches channel detail with `/api/v2/channels/one`.
3. Server fetches account with `/api/v2/self` to determine owner-only tools.
4. Server fetches similar streams with `/api/v2/channels/similar`.
5. Server seeds `TimelineWidget` with `/api/v2/streams/getSchedule` using `channel.sid`.
6. Browser `TimelineWidget` refetches schedule with `channel.sid`, then schedules next refresh at current track end or 5 seconds max.
7. Browser `PlayerToggle` starts listener audio with `/flow?s=<channel.sid>&f=<format>`.

## Header Search Data Flow

1. User types in `HeaderSearchForm`.
2. Component calls local `/api/v2/channels/suggest?query=...`.
3. Proxy forwards to legacy host.
4. Dropdown renders search row plus stream rows.
5. Arrow keys update `selectedIndex`; Enter navigates to selected search or stream target.

## State Keys

| State | Owner | Shape |
| --- | --- | --- |
| Header search | `HeaderSearchForm` | `{ filter: string; focused: boolean; streams: Stream[]; selectedIndex: number }` |
| Audio format | `ChannelTools`, `PlayerToggle` | `localStorage["mor.defaults.format"]`, fallback `mp3_128k` |
| Playback | `PlayerToggle` | `{ playing: boolean }` plus module-level `sharedAudio` and `playingStreamSid` |
| Timeline | `TimelineWidget` | `{ schedule: ScheduleResponse; containerWidth: number }` |
| Bookmark | `BookmarkToggle` | `{ bookmarked: boolean; count: number; pending: boolean }` |

## Known Gaps

| Area | Current state |
| --- | --- |
| Global player bar | Not implemented; only stream page button owns playback UI. |
| Cross-component playback state | `PlayerToggle` uses module-level audio state; no app-wide store yet. |
| Format picker data | Stream page passes empty `formats`; legacy format options are not populated from app defaults yet. |
| Typecheck | `tsc --noEmit` is blocked by pre-existing missing API type exports in `lib/api/types.ts`. |

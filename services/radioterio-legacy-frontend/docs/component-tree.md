# Component Tree And State Map

This document maps legacy AngularJS routes/controllers to target Next.js route components and child components. Component names intentionally keep controller names visible during migration.

## Shared App Shell

| Path scope | Route component | Legacy source | Children |
| --- | --- | --- | --- |
| all routes | `RootLayout` | `index.tmpl`, `MainController` | `BusyOverlay`, `CoolPlayerBar`, `Header`, `MainContent`, `Footer`, `PopupHost` |

State:

```ts
type AppShellState = {
  rootClass: string | null;
  url: string;
  loader: { busy: boolean };
  openedDialogs: number;
  lib: AppCollection;
  defaults: {
    format: string;
    formats: AudioFormatGroups;
  };
};
```

```ts
type AccountState = {
  authorized: boolean;
  user: User | null;
  pending: boolean;
  streams: Stream[] | null;
  client_id: string | null;
};
```

```ts
type PlayerState = {
  isRadioPlayerPlaying: boolean;
  isRadioPlayerBuffering: boolean;
  playingChannelId: number | null;
  playingChannel: Stream | null;
  trackTitle: string | null;
  format: string;
};
```

## Shared Children

| Component | Legacy controller/directive | State shape |
| --- | --- | --- |
| `Header` | `header` directive | reads `AccountState`, `AppShellState.url` |
| `HeaderSearchForm` | `SearchFormController` | `{ filter: string; streams: Stream[]; focused: boolean }` |
| `MainNavigation` | `NavigationController`, `mainNavigation` directive | reads current pathname and `AccountState` |
| `Footer` | `footer` directive | stateless |
| `CoolPlayerBar` | `player.js`, MobX `$store` shell | `PlayerState` |
| `PlayButton` | `play` directive | `{ channel: Stream; isCurrent: boolean; isBuffering: boolean }` |
| `StreamCardGrid` | `grid.html`, `ChannelListActions` | `ChannelListState` |
| `StreamCard` | `grid.html` item | `{ channel: Stream; action: ChannelActions }` |
| `BookmarkButton` | `bookmark`, `bookmarkIcon` directives | `{ stream: Stream; pending: boolean }` |
| `TagList` | `tagsList` directive | `{ tags: string[] }` |
| `ShareChannelDialog` | `StreamShareController` | `{ streamObject: Stream; embed: ShareEmbedState; code: string }` |
| `ChangeImageDialog` | `ChangeImageController` | `{ url: string | null; file: File | null }` |
| `TrackInfoDialog` | `TrackInfoController` | `{ source: Track[]; metadata: TrackMetadataFormState; status: string }` |

```ts
type ChannelListState = {
  data: ChannelListResponse;
  empty: boolean;
  busy: boolean;
  end: boolean;
};
```

```ts
type ChannelActions = {
  bookmark: () => Promise<void>;
  play: () => void;
  removeTrack?: (track: Track) => Promise<void>;
};
```

## Public Routes

| Legacy path | Next route component | Legacy controller | Children | State shape |
| --- | --- | --- | --- | --- |
| `/` | `HomeRoute` | none | `HomeHero`, `HeaderSearchForm` | reads `AppShellState.rootClass = "image"` |
| `/categories/` | `CategoriesRoute` | none | `CategoryGrid`, `CategoryTile` | `{ categories: Category[] }` from `lib.categories` |
| `/category/` | redirect to `/categories/` | none | none | none |
| `/category/:id` | `ChannelListCategoryRoute` | `ChannelListCategory` | `StreamListPageHeader`, `StreamCardGrid`, `StreamCard`, `LoadMoreSentinel` | `ChannelListState` |
| `/tag/:tag` | `ChannelListTagRoute` | `ChannelListTag` | `StreamListPageHeader`, `StreamCardGrid`, `LoadMoreSentinel` | `ChannelListState & { tag: string }` |
| `/search/:query` | `ChannelListSearchRoute` | `ChannelListSearch` | `StreamListPageHeader`, `StreamCardGrid`, `LoadMoreSentinel` | `ChannelListState & { query: string }` |
| `/user/` | redirect to `/` | none | none | none |
| `/user/:key` | `ChannelListUserRoute` | `ChannelListUser` | `UserStreamsHeader`, `StreamCardGrid`, `LoadMoreSentinel` | `ChannelListState & { name: string; user: User }` |
| `/streams/` | `ChannelListPopularRoute` | `ChannelListPopular` | `StreamListPageHeader`, `StreamCardGrid`, `LoadMoreSentinel` | `ChannelListState` |
| `/new/` | `ChannelListNewRoute` | `ChannelListNew` | `StreamListPageHeader`, `StreamCardGrid`, `LoadMoreSentinel` | `ChannelListState` |
| `/recent/` | `ChannelListRecentRoute` | `ChannelListRecent` | `StreamListPageHeader`, `StreamCardGrid`, `LoadMoreSentinel` | `ChannelListState` |
| `/bookmarks/` | `ChannelListBookmarksRoute` | `ChannelListBookmarks` | `StreamListPageHeader`, `StreamCardGrid`, `LoadMoreSentinel` | `ChannelListState` |
| `/my/` | `ChannelListMeRoute` | `ChannelListMe` | `UserStreamsHeader`, `StreamCardGrid`, `LoadMoreSentinel` | `ChannelListState & { name: string; user: User }` |
| `/streams/:key` | `ChannelViewRoute` | `ChannelView` | `StreamHero`, `StreamAudioSettings`, `StreamTimeline`, `TagList`, `SimilarStreams`, `ShareChannelDialog` | `ChannelViewState` |

```ts
type ChannelViewState = {
  data: ChannelDetailWithSimilarResponse;
  scheduleShown: boolean;
  schedule: {
    source: ScheduleItem[] | null;
    destination: ScheduleItem[] | null;
  };
  action: ChannelActions;
};
```

## Account Routes

| Legacy path | Next route component | Legacy controller | Children | State shape |
| --- | --- | --- | --- | --- |
| `/login/` | `LoginFormRoute` | `LoginForm` | `LoginForm`, `FacebookLoginButton`, `FormStatus` | `LoginFormState` |
| `/signup` | `SignUpBeginFormRoute` | `SignUpBeginForm` | `SignUpBeginForm`, `FacebookLoginButton`, `FormStatus` | `SignUpBeginState` |
| `/signup/:code` | `SignUpCompleteFormRoute` | `SignUpCompleteForm` | `SignUpCompleteForm`, `CountrySelect`, `FormStatus` | `SignUpCompleteState` |
| `/recover` | `PasswordResetBeginFormRoute` | `PasswordResetBeginForm` | `PasswordResetBeginForm`, `FormStatus` | `PasswordResetBeginState` |
| `/recover/:code` | `PasswordResetCompleteFormRoute` | `PasswordResetCompleteForm` | `PasswordResetCompleteForm`, `FormStatus` | `PasswordResetCompleteState` |
| `/static/registrationLetterSent` | `RegistrationLetterSentRoute` | none | `StaticMessage` | stateless |
| `/static/registrationCompleted` | `RegistrationCompletedRoute` | none | `StaticMessage` | stateless |
| `/static/resetLetterSent` | `ResetLetterSentRoute` | none | `StaticMessage` | stateless |
| `/static/resetPasswordCompleted` | `ResetPasswordCompletedRoute` | none | `StaticMessage` | stateless |

```ts
type LoginFormState = {
  credentials: { login: string; password: string; save: boolean };
  status: string;
};

type SignUpBeginState = {
  signup: { email: string; code: string };
  status: string;
};

type SignUpCompleteState = {
  signup: {
    code: string;
    login: string;
    password: string;
    name: string;
    info: string;
    permalink: string;
    country_id: number | null;
  };
  check: string;
  status: string;
};

type PasswordResetBeginState = {
  reset: { login: string };
  status: string;
};

type PasswordResetCompleteState = {
  reset: { code: string; password: string };
  check: string;
  status: string;
};
```

## Profile Routes

| Legacy path | Next route component | Legacy controller | Children | State shape |
| --- | --- | --- | --- | --- |
| `/profile/` | `ProfileHomeRoute` | none | `ProfileSummary`, `MainNavigation` | reads `AccountState.user` |
| `/profile/edit` | `ProfileControllerRoute` | `ProfileController`, `UserAvatarController` | `ProfileEditForm`, `UserAvatarUploader`, `CountrySelect`, `FormStatus` | `ProfileEditState`, `UserAvatarState` |
| `/profile/password` | `ChangePasswordControllerRoute` | `ChangePasswordController` | `ChangePasswordForm`, `FormStatus` | `ChangePasswordState` |
| `/profile/plan` | `ChangePlanControllerRoute` | `ChangePlanController` | `ChangePlanForm`, `FormStatus` | `ChangePlanState` |

```ts
type ProfileEditState = {
  details: User | null;
  status: string;
  error: string;
};

type UserAvatarState = {
  avatarUrl: string | null;
  pending: boolean;
  error: string;
};

type ChangePasswordState = {
  passwords: { current: string; password1: string };
  check: string;
  status: string;
  error: string;
};

type ChangePlanState = {
  data: { code: string; error: string };
};
```

## Library And Stream Management Routes

| Legacy path | Next route component | Legacy controller | Children | State shape |
| --- | --- | --- | --- | --- |
| `/profile/tracks/` | `TracksLibraryControllerRoute` | `TracksLibraryController` | `TracksToolbar`, `TrackTable`, `TrackRow`, `UploadDialog`, `TrackInfoDialog`, `TrackGroupMenu` | `TracksLibraryState` |
| `/profile/tracks/unused` | `UnusedTracksLibraryControllerRoute` | `TracksLibraryController` | `TracksToolbar`, `TrackTable`, `UploadDialog`, `TrackInfoDialog` | `TracksLibraryState & { unused: true }` |
| `/profile/streams/` | `MyStreamsControllerRoute` | `MyStreamsController` | `MyStreamsStats`, `MyStreamsTable`, `MyStreamRow`, `StreamContextMenu` | reads `AccountState.streams` |
| `/profile/streams/:id` | `StreamLibraryControllerRoute` | `StreamLibraryController` | `StreamTracksToolbar`, `StreamTracksTable`, `TrackRow`, `UploadDialog`, `TrackInfoDialog`, `TrackGroupMenu` | `StreamLibraryState` |
| `/profile/edit-stream/:id` | `StreamEditorControllerRoute` | `StreamEditorController`, `StreamCoverController` | `StreamEditorForm`, `StreamCoverUploader`, `CategorySelect`, `AccessSelect`, `FormStatus` | `StreamEditorState`, `StreamCoverState` |
| `/profile/new-stream` | `NewStreamControllerRoute` | `NewStreamController`, `NewStreamCoverController` | `NewStreamForm`, `NewStreamCoverPicker`, `CategorySelect`, `AccessSelect`, `FormStatus` | `NewStreamState` |

```ts
type TracksLibraryState = {
  tracksPending: boolean;
  tracks: Track[];
  target: Track[];
  filter: string;
  busy: boolean;
  sorting: {
    row: number;
    order: number;
  };
};

type StreamLibraryState = {
  tracksPending: boolean;
  tracks: Track[];
  stream: Stream | null;
  target: Track[];
  filter: string;
  busy: boolean;
  empty: boolean;
  sortableOptions: {
    axis: "y";
    items: string;
  };
};

type UploadDialogState = {
  upNext: boolean;
  progress: {
    status: boolean;
    file: string | null;
    percent: number;
  };
  uploadQueue: File[];
  options: {
    target: number | null;
    append: boolean;
    unique: boolean;
  };
};

type StreamEditorState = {
  stream: Partial<Stream>;
  error: string;
};

type StreamCoverState = {
  coverUrl: string | null;
  cover: string | null;
  pending: boolean;
  error: string;
};

type NewStreamState = {
  status: string;
  error: string;
  stream: {
    name: string;
    info: string;
    hashtags: string;
    permalink: string;
    category: number;
    access: string;
  };
  cover: File | null;
  preview: string | null;
};
```

## Dialog State

```ts
type TrackMetadataFormState = {
  save_title: boolean;
  title: string;
  save_artist: boolean;
  artist: string;
  save_album: boolean;
  album: string;
  save_track_number: boolean;
  track_number: string;
  save_genre: boolean;
  genre: string;
  save_date: boolean;
  date: string;
  save_buy: boolean;
  buy: string;
  save_can_be_shared: boolean;
  can_be_shared: boolean | number;
};

type ShareEmbedState = {
  url: string;
  maxSize: number;
};
```

## Migration Notes

- Route components should own route params, initial fetches, redirects, and metadata.
- Children should preserve legacy class names from the matching `../backend/public/views/*.html` templates.
- Controller names stay in component names until each route reaches feature parity.
- `ChannelList*` controllers share one state shape and should share one hook, e.g. `useChannelListController`.
- `TracksLibraryController` powers both `/profile/tracks/` and `/profile/tracks/unused`; `unused` is a route flag.
- `UploadController` is a dialog component used by both account track library and stream track library.

# AngularJS To Next.js Migration Plan

## Goal

Migrate the Radioterio AngularJS frontend from `../backend` into this Next.js app while preserving public routes, API contracts, audio behavior, account flows, and visual identity.

Target stack:
- Next.js `16.2.9`
- React `19.2.4`
- TypeScript strict mode
- App Router under `app/`
- One global CSS file for migrated legacy UI

Legacy source:
- App shell: `../backend/application/tmpl/frontend/index.tmpl`
- Routes: `../backend/public/js/mor-modules/main.ang.js`
- Angular modules: `../backend/public/js/mor-modules/`
- Views: `../backend/public/views/`
- Assets/styles: `../backend/public/css/`, `../backend/public/images/`, `../backend/public/icomoon/`, `../backend/public/fonts/`

## Current State

Phase 0 is complete:
- `app/layout.tsx` no longer uses `next/font/google`, so the app does not fetch fonts at build time.
- Metadata is set to Radioterio.
- `app/page.tsx` renders a minimal Radioterio shell instead of the default Next.js scaffold.
- `app/globals.css` is the single global CSS baseline; Tailwind is not imported.

Foundation work also completed:
- `lib/api/client.ts` unwraps legacy `{ code, data, message }` responses.
- `lib/api/types.ts` defines app-expected API/domain types.
- `docs/component-tree.md` maps route paths, controller names, children, and state shapes.

Current verification:
- `npm run lint` passes.
- `npx tsc --noEmit` passes.
- `npm run build` passes when run outside the sandbox/escalated. Turbopack needs permission to create its local worker process/port for CSS transform.

## Migration Principles

- Migrate one route group at a time.
- Keep backend API behavior unchanged.
- Keep UI behavior equivalent before visual cleanup.
- Do not import AngularJS, jQuery, or legacy bundled app code into the new app.
- Reuse legacy images, fonts, icons, class names, and global CSS.
- Do not migrate UI to Tailwind utilities. Keep legacy class names in React markup so copied global styles can apply.
- Keep network code in `lib/api/`; keep React components free of raw fetch calls.
- Mark interactive components with `"use client"` only when browser state or effects are required.

## Target Structure

Use root-level folders because `tsconfig.json` maps `@/*` to `./*`.

```text
app/
  layout.tsx
  page.tsx
  login/page.tsx
  profile/page.tsx
  ...
components/
  layout/
  player/
  streams/
  account/
hooks/
  use-account.ts
  use-player.ts
lib/
  api/
    client.ts
    account.ts
    streams.ts
    tracks.ts
    categories.ts
    bookmarks.ts
types/
  api.ts
  account.ts
  stream.ts
public/
  legacy/
```

## Route Inventory

Source route table: `../backend/public/js/mor-modules/main.ang.js`.

### Public Routes

| Legacy route | Legacy view | Target route |
| --- | --- | --- |
| `/` | `views/home.html` | `app/page.tsx` |
| `/login/` | `views/login.html` | `app/login/page.tsx` |
| `/signup` | `views/forms/signUpBegin.html` | `app/signup/page.tsx` |
| `/signup/:code` | `views/forms/signUpComplete.html` | `app/signup/[code]/page.tsx` |
| `/recover` | `views/forms/recoverPassword1.html` | `app/recover/page.tsx` |
| `/recover/:code` | `views/forms/recoverPassword2.html` | `app/recover/[code]/page.tsx` |
| `/categories/` | `views/categories.html` | `app/categories/page.tsx` |
| `/category/:id` | `views/catalog/by-category.html` | `app/category/[id]/page.tsx` |
| `/tag/:tag` | `views/catalog/by-tag.html` | `app/tag/[tag]/page.tsx` |
| `/search/:query` | `views/catalog/by-search.html` | `app/search/[query]/page.tsx` |
| `/user/:key` | `views/catalog/by-user.html` | `app/user/[key]/page.tsx` |
| `/streams/` | `views/catalog/by-popularity.html` | `app/streams/page.tsx` |

### Static Result Routes

| Legacy route | Legacy view | Target route |
| --- | --- | --- |
| `/static/registrationLetterSent` | `views/static/registrationLetterSent.html` | `app/static/registrationLetterSent/page.tsx` |
| `/static/registrationCompleted` | `views/static/registrationCompleted.html` | `app/static/registrationCompleted/page.tsx` |
| `/static/resetLetterSent` | `views/static/resetLetterSent.html` | `app/static/resetLetterSent/page.tsx` |
| `/static/resetPasswordCompleted` | `views/static/resetPasswordCompleted.html` | `app/static/resetPasswordCompleted/page.tsx` |

### Authenticated Routes

| Legacy route | Legacy view | Target route |
| --- | --- | --- |
| `/profile/` | `views/auth/profile.html` | `app/profile/page.tsx` |
| `/profile/edit` | `views/auth/editprofile.html` | `app/profile/edit/page.tsx` |
| `/profile/password` | `views/auth/change-password.html` | `app/profile/password/page.tsx` |
| `/profile/plan` | `views/auth/change-plan.html` | `app/profile/plan/page.tsx` |
| `/profile/tracks/` | `views/auth/tracks.html` | `app/profile/tracks/page.tsx` |
| `/profile/tracks/unused` | `views/auth/tracks.html` | `app/profile/tracks/unused/page.tsx` |
| `/profile/streams/` | `views/auth/streams.html` | `app/profile/streams/page.tsx` |
| `/profile/streams/:id` | `views/auth/stream.html` | `app/profile/streams/[id]/page.tsx` |
| `/profile/edit-stream/:id` | `views/auth/edit-stream.html` | `app/profile/edit-stream/[id]/page.tsx` |
| `/profile/new-stream` | `views/auth/new-stream.html` | `app/profile/new-stream/page.tsx` |

## Core Module Mapping

| Legacy module | Main responsibility | Target |
| --- | --- | --- |
| `account.js` | login, signup, reset password, user session | `lib/api/account.ts`, `hooks/use-account.ts`, `components/account/*` |
| `catalog.js` | stream lists, stream details, search, stream edit/create | `lib/api/streams.ts`, `components/streams/*` |
| `library.js` | user tracks, uploads, stream-track management | `lib/api/tracks.ts`, `components/library/*` |
| `player.js` | playback, preview, current stream state | `hooks/use-player.ts`, `components/player/*` |
| `mor.stream.scheduler.js` | now playing and schedule timeline | `lib/api/schedule.ts`, `components/player/schedule-*` |
| `profile.js` | profile edit, avatar, password, navigation | `components/profile/*`, `lib/api/profile.ts` |
| `api/*.js` | REST wrappers | `lib/api/*` |
| `site.js` | global helpers/directives/forms | shared React components, hooks, utils |

## Phase 0: Build Health

Status: complete.

Deliverables:
- [x] Remove remote Google font dependency from `app/layout.tsx`.
- [x] Update default metadata to Radioterio.
- [x] Replace default scaffold body with a minimal app shell.
- [x] Remove Tailwind import from `app/globals.css`.
- [x] Add one global CSS baseline using legacy class names where practical.

Acceptance:
- [x] `npm run lint` passes.
- [x] `npx tsc --noEmit` passes.
- [x] `npm run build` passes with escalated run.

Note:
- Sandboxed `npm run build` can fail with a Turbopack internal error when CSS processing tries to bind a local worker port. Escalated `npm run build` succeeds.

## Phase 1: Legacy Asset And Global Style Baseline

Status: next.

Deliverables:
- Copy required images/fonts/icons to `public/legacy/`.
- Create one global stylesheet for migrated legacy UI, imported from `app/globals.css`.
- Start from legacy global CSS/LESS output and rewrite asset URLs to `public/legacy/` paths.
- Preserve legacy class names in React components instead of translating the UI to Tailwind utility classes.
- Build shared app layout components: header, nav, footer, main content wrapper.

Acceptance:
- Home route visually resembles legacy shell enough to host migrated screens.
- No runtime references to `../backend/public/*`.
- No Tailwind utility rewrite of legacy screens.

## Phase 2: API Client

Status: partially complete.

Deliverables:
- [x] `lib/api/client.ts` with typed response unwrap for legacy `{ code, data, message }` responses.
- [x] Shared API/domain types in `lib/api/types.ts`.
- Domain clients:
  - [ ] `lib/api/account.ts`
  - [ ] `lib/api/streams.ts`
  - [ ] `lib/api/tracks.ts`
  - [ ] `lib/api/categories.ts`
  - [ ] `lib/api/bookmarks.ts`
  - [ ] `lib/api/schedule.ts`

Acceptance:
- [ ] Each migrated route uses typed API functions only.
- [x] Error handling preserves legacy message behavior.
- [x] API base path supports local proxy or deployed backend without code changes.

## Phase 3: Account And Auth Gate

Legacy sources:
- `../backend/public/js/mor-modules/account.js`
- `../backend/public/views/login.html`
- `../backend/public/views/forms/*.html`
- `../backend/public/views/static/*.html`

Deliverables:
- Login page.
- Signup start/complete pages.
- Password recovery start/complete pages.
- Static success pages.
- Account provider/hook for `authorized`, `user`, `streams`, `pending`, and `client_id`.
- Auth guard behavior for profile routes.

Acceptance:
- Unauthenticated profile route redirects to `/login`.
- Login redirects to requested `go` path or `/profile/`.
- Logout clears account state.

## Phase 4: Public Catalog

Legacy sources:
- `../backend/public/js/mor-modules/catalog.js`
- `../backend/public/js/mor-modules/controllers/controllers.channels.js`
- `../backend/public/views/catalog/*.html`
- `../backend/public/views/categories.html`

Deliverables:
- Home page.
- Popular, new, recent, bookmarks, category, tag, user, and search stream list routes.
- Stream card component.
- Infinite-scroll replacement using an explicit load-more/intersection observer hook.
- Category grid.

Acceptance:
- Route titles and empty/error states match legacy intent.
- Pagination offsets and limits match legacy API use.
- Bookmark/play controls do not break if user is unauthenticated.

## Phase 5: Player And Stream Detail

Legacy sources:
- `../backend/public/js/mor-modules/player.js`
- `../backend/public/js/mor-modules/directives/directives.player.js`
- `../backend/public/js/mor-modules/mor.stream.scheduler.js`
- `../backend/public/views/catalog/single-stream.html`

Deliverables:
- Global audio player.
- Play/pause, preview, now-playing refresh, and schedule display.
- Stream detail page.
- Share block and track menu equivalents where used.

Acceptance:
- Audio starts/stops reliably across route changes.
- Only one stream plays at a time.
- Now-playing refresh does not leak timers.
- Mobile layout keeps player controls usable.

## Phase 6: Profile And Library

Legacy sources:
- `../backend/public/js/mor-modules/profile.js`
- `../backend/public/js/mor-modules/library.js`
- `../backend/public/js/mor-modules/audioinfo.js`
- `../backend/public/views/auth/*.html`

Deliverables:
- Profile dashboard.
- Edit profile and avatar change flow.
- Change password and plan code flows.
- Track library.
- Unused tracks view.
- Stream library.
- Stream edit/create forms.
- Track metadata editor.

Acceptance:
- Existing user can manage streams and tracks.
- Form validation mirrors legacy requirements.
- Upload and edit flows show progress/errors.

## Phase 7: Uploads And High-Risk Flows

Legacy sources:
- `../backend/public/js/angular/ng-flow-standalone.min.js`
- `../backend/public/js/mor-modules/library.js`
- `../backend/app/Helpers/Upload.php`

Deliverables:
- Chunked upload replacement or compatible upload client.
- Upload progress, retry, cancel, and success handling.
- Track assignment to streams.

Acceptance:
- Uploaded track appears in library.
- Failed upload displays useful error.
- Large files follow backend constraints.

## Phase 8: Cleanup And Verification

Deliverables:
- Remove default Next assets and unused scaffold content.
- Remove unused copied legacy assets.
- Add smoke tests or manual verification checklist for major routes.
- Document remaining known gaps.

Acceptance:
- `npm run lint` passes.
- `npm run build` passes.
- Public catalog, auth, player, and profile smoke checks pass.

## Endpoint Audit Starter

Known endpoints from current scan:
- `/api/v2/streams/getOne`
- `/api/v2/streams/getList`
- `/api/v2/streams/getSimilarTo`
- `/api/v2/streams/getOneWithSimilar`
- `/api/v2/streams/getStreamsByUser`
- `/api/v2/streams/getBookmarks`
- `/api/v2/streams/getSchedule`
- `/api/v2/streams/getNowPlaying`
- `/api/v2/stream/modify`
- `/api/v2/stream/create`
- `/api/v2/stream/delete`

Before migrating each module, extend this audit from:
- `../backend/public/js/mor-modules/api/*.js`
- `$http` calls inside `../backend/public/js/mor-modules/*.js`

## Risks

- Audio playback and route changes can leak timers or keep stale audio alive.
- Upload behavior may depend on legacy `ng-flow` chunk parameter names.
- Auth may rely on cookies/session state rather than explicit tokens.
- Legacy CSS assumes global DOM shape and class names from Angular templates.
- Global CSS can be copied as the baseline, but asset URLs and Angular-only structural assumptions must be adapted.
- Search/catalog routes rely on backend-specific response envelopes and title side effects.

## Suggested Order

1. Phase 0: make build pass. Done.
2. Phase 1: shell/assets/styles. Next.
3. Phase 2: API client/types. Partially done; domain clients remain.
4. Phase 3: account/auth.
5. Phase 4: public catalog.
6. Phase 5: player/stream detail.
7. Phase 6: profile/library.
8. Phase 7: uploads.
9. Phase 8: cleanup/verification.

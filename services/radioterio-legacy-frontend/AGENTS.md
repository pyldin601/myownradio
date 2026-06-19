# AGENTS.md

## Mission

Migrate the legacy AngularJS frontend from `../backend` into this Next.js app.

Primary goals:
- Preserve user-facing behavior, URLs, API contracts, audio playback behavior, and visual identity.
- Replace AngularJS controllers, services, directives, filters, and templates with typed React/Next.js code.
- Keep migration incremental and verifiable. Do not rewrite backend PHP/API code unless explicitly asked.

## Source And Target

Legacy source lives in `../backend`:
- AngularJS app shell: `../backend/application/tmpl/frontend/index.tmpl`
- AngularJS modules: `../backend/public/js/mor-modules/`
- Legacy views/templates: `../backend/public/views/`
- Legacy styles/assets: `../backend/public/css/`, `../backend/public/images/`, `../backend/public/icomoon/`, `../backend/public/fonts/`
- Existing migration notes: `../backend/MIGRATION_PLAN.md`, `../backend/MIGRATION_SPEC.md`

Target app is this service:
- Next.js App Router: `app/`
- Shared code should be added at repo root using the existing `@/*` alias.
- Do not introduce a `src/` tree unless the project is intentionally reorganized.

## Next.js Rules

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

This project uses Next.js `16.2.9`, React `19.2.4`, TypeScript strict mode, and App Router.

Do not migrate UI to Tailwind. Prefer one global CSS file that preserves legacy class names and global styling semantics.

Before using an unfamiliar Next.js API, check local docs under `node_modules/next/dist/docs/`.

## Legacy CSS Parity Rules

- Treat legacy CSS as authoritative. Do not add local Next.js layout overrides for migrated legacy markup unless the exact rule also exists in legacy CSS or fixes a documented Next-only incompatibility.
- Keep `app/globals.css` limited to legacy CSS imports plus framework shims required to make legacy semantics work in Next.js, such as Angular's `.ng-hide` runtime style.
- Before adding any CSS selector in `app/globals.css`, search legacy styles first and prefer changing markup/class names to match legacy selectors instead of overriding layout.
- Do not add responsive/mobile overrides while preserving a legacy route. The legacy app uses a fixed `width=1024` viewport and fixed-width layout; match that first.
- Do not override header, footer, `#contents`, `.special`, `.hello-page`, `.fixed-width`, `#links`, `#buttons`, `#search`, or form control box model from Next-specific CSS. These selectors are layout-critical and must come from copied legacy CSS.
- If copied legacy CSS contains syntax that Next cannot parse, remove only the unsupported compatibility declaration from the Next copy, and document that transformation. Do not replace it with new layout behavior.
- After CSS changes, compare the local page against `https://radioter.io/` with the same viewport and check computed positions for the changed elements before calling the change done.

## Migration Workflow

For each feature/page:
1. Read the matching legacy AngularJS view in `../backend/public/views/`.
2. Read its controller/service/directive code in `../backend/public/js/mor-modules/`.
3. Map `$scope` state to React state/hooks, `$rootScope` events to explicit context/store actions, and `$http` calls to typed API functions.
4. Port only the needed behavior for the current route/component. Avoid broad rewrites.
5. Preserve legacy class names and reuse global legacy styles where practical, then simplify only after behavior is stable.
6. Run `npm run lint` after code changes.

## Architecture Rules

- Prefer Server Components for static shell/data that can render on server.
- Use `"use client"` only for interactive UI, audio playback, browser APIs, local storage, drag/drop, upload, or live state.
- Put reusable UI in `components/`.
- Put hooks in `hooks/`.
- Put API clients/services in `lib/api/`.
- Put shared types in `types/`.
- Put copied legacy assets in `public/legacy/` when they need public URLs.
- Keep API logic out of React components.

## Legacy Mapping

- AngularJS controller -> React component plus hook when logic is nontrivial.
- AngularJS service/factory -> `lib/api/*` for network code, `hooks/*` or store for UI state.
- AngularJS directive -> React component.
- AngularJS filter -> pure TypeScript function.
- AngularJS route/template -> App Router route under `app/`.
- jQuery DOM mutation -> React state/refs/effects.

## API Rules

- Preserve backend endpoint paths and payload shapes unless backend migration is explicitly requested.
- Create typed request/response models before wiring UI.
- Normalize backend responses at API boundary, not inside components.
- Keep auth/session behavior equivalent to legacy `Account`, `User`, and bookmark flows.
- Treat upload, stream scheduling, and audio playback as high-risk paths. Port with focused tests or manual verification notes.

## UI Rules

- Match legacy visual behavior first. Modernize only where it does not change expected UX.
- Use real legacy assets from `../backend/public/images/`, fonts, and icon assets when needed.
- Use one global stylesheet for migrated legacy UI. Avoid CSS modules, CSS-in-JS, or Tailwind utility rewrites unless explicitly requested.
- Copy legacy class names into React markup so global CSS can apply with minimal translation.
- Avoid marketing-page patterns. This is a functional radio service UI.
- Keep controls dense, predictable, and usable on mobile and desktop.

## Safety

- Do not delete or mutate files in `../backend` unless explicitly asked.
- Do not vendor AngularJS, jQuery, or legacy bundles into the new app as a shortcut.
- Do not silence TypeScript or lint errors with `any`, broad disables, or casts unless the legacy API shape is genuinely unknown and documented.
- Do not create migration docs unless asked; put durable guidance here or in code comments only where needed.

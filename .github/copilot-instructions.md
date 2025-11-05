## Purpose

Short guidance for AI coding agents working in this Nuxt 3 / TypeScript monorepo-style app.
Focus: where code lives, conventions to follow, and concrete examples to speed up changes.

## Big picture

- Single Nuxt 3 app with source rooted in `app/` (see `nuxt.config.ts` -> `srcDir: 'app/'`).
- Server routes live in `app/server` (configured via `serverDir: 'app/server'`). Example: `app/server/api/login.post.ts` and `app/server/api/ewm/[...path].get.ts`.
- Feature modules live under `app/modules` (e.g. `app/modules/tools/data-flow-service/ewm`). Modules may include `components/`, `composables/`, and `stores/`.
- Runtime configuration and toggles: `nuxt.config.ts` defines `runtimeConfig.ewm` (server) and `runtimeConfig.public.ewm` (client). Mocking is driven by `EWM_USE_MOCK=1` (see `ewmUseMock` and `ewmFallbackToMock`). Mock responses live under `app/server/mocks/ewm/*.json`.

## Key developer workflows

- Use pnpm (there is a `pnpm-lock.yaml`). Common scripts in `package.json`:
  - `pnpm dev` → `nuxt dev`
  - `pnpm build` → `nuxt build`
  - `pnpm preview` → `nuxt preview`
  - `pnpm install` will run `postinstall` which executes `nuxt prepare`.
- To run locally with EWM mocks on Windows PowerShell:
  - $env:EWM_USE_MOCK = '1'; pnpm dev

## Project-specific conventions (examples)

- Auto-registered components: `nuxt.config.ts` adds component folders and prefixes. Examples:
  - Shared components: `~/shared/components` (no prefix)
  - Data Flow Service shared UI: `~/modules/tools/data-flow-service/shared/components` -> prefix `Dfs`
  - EWM-specific components: `~/modules/tools/data-flow-service/ewm/components` -> prefix `Ewm`

- Composables auto-import: `nuxt.config.ts` imports from `modules/**/composables` and nested paths. Example:
  - `app/modules/tools/data-flow-service/ewm/composables/useEwmSessions.ts` exports `useEwmSessions`.
  - Pattern inside composables: use `useRuntimeConfig()` and `useAsyncData()` to fetch server data (see `useEwmSessions` which keys fetch with `ewm:sessions:${skip}:${limit}`).

- Stores: Pinia is used and `storesDirs` includes `modules/**/stores`. Place module-local stores under `stores` inside the module.

- Server API naming: file name encodes HTTP method when using single-file handlers (e.g. `login.post.ts`) and dynamic catch-all routes use `[...path].get.ts` under `app/server/api/ewm`.

- Server-side code uses Zod for runtime validation and Nuxt server utilities (`defineEventHandler`, `readBody`, `createError`). See `app/server/api/login.post.ts` for an example.

## Integration and data flow

- Client composables call EWM APIs using `useRuntimeConfig().public.ewm.baseURL` (client-visible URL is `/api/ewm`). The server proxy/handler is in `app/server/api/ewm/[...path].get.ts` and will return mock JSON from `app/server/mocks/ewm` when `EWM_USE_MOCK=1`.
- Example call chain: `UI component (Ewm*)` → `composable (useEwmSessions)` → `useAsyncData/$fetch` to `${base}/api/data/sessions` → server handler under `app/server/api/ewm` → returns mock JSON from `app/server/mocks/ewm` or forwards to real EWM backend using runtimeConfig.

## Helpful file examples to inspect

- `nuxt.config.ts` — shows srcDir/serverDir, auto-imports, components registration, runtimeConfig.
- `app/server/api/login.post.ts` — pattern for server route, Zod validation and error handling.
- `app/server/mocks/ewm/*.json` — mock responses used during development.
- `app/modules/tools/data-flow-service/ewm/composables/useEwmSessions.ts` — canonical composable using useAsyncData and runtimeConfig.

## When editing/adding modules

- To add a new tool/domain: add `app/modules/tools/<your-tool>/...` and place components/composables/stores under the expected folders so Nuxt auto-imports pick them up.
- If you add UI components that could conflict with others, add a prefix entry in `nuxt.config.ts` components array (follow the Dfs/Ewm examples).

## Small practical hints

- Prefer composables in `composables/` and match naming `useXxx` — they are auto-imported.
- Use `useAsyncData` server:true default pattern for module data that should be fetched on the server.
- Reuse mock files under `app/server/mocks/ewm` for prototype responses; toggle with `EWM_USE_MOCK=1`.

If anything above is unclear or you'd like additional examples (e.g., a PR template for module additions or example tests), tell me what to add and I will update this file.

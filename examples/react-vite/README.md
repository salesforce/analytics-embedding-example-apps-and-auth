# React 19 + Vite — Analytics Embedding SDK example

A runnable example of `@salesforce/analytics-embedding-sdk` in a modern
React 19 + Vite 6 + TypeScript project.

## Run locally

```bash
npm install
npm run dev
# Open http://localhost:5173
```

The first time you open the app you'll see a config form. Paste your
`https://yourorg.lightning.force.com` URL and a frontdoor URL, then click
**Save and connect**.

> Need a frontdoor URL? See [`docs/how-to-get-frontdoor-url.md`](../../docs/how-to-get-frontdoor-url.md) at the repo root.

## Build for production

```bash
npm run build      # outputs dist/
npm run preview    # serves the production build locally
```

`vite.config.ts` sets `base: './'` so the `dist/` output works under any
sub-path (root, `/react-vite/` on GitHub Pages, etc.) without rebuilding.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | `tsc -b && vite build` — typecheck then bundle |
| `npm run preview` | Serve the production bundle locally |
| `npm run lint` | ESLint on `src/` and `test/` |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm test` | Vitest run (smoke tests, SDK mocked) |

## What this example teaches

- How to gate an SDK-using app behind an in-app config form (no `.env`
  required for demos).
- How to integrate the SDK's **class API** (`new AnalyticsDashboard(...)`)
  with React 19's lifecycle — mount in `useEffect`, dispose on cleanup.
- How to handle the three init outcomes: `Status.Success`,
  `Status.Failure`, and `OrgStates.AUTH_REDIRECT` (MFA path).
- How to push a filter into a dashboard programmatically with
  `dash.applyFilters(...)`.
- How to lazy-load the AnalyticsAgent route with `React.lazy` + `Suspense`.

## Files of interest

| File | Why |
|---|---|
| [`src/App.tsx`](src/App.tsx) | Router + ConfigGate orchestration; init-state machine |
| [`src/ConfigGate.tsx`](src/ConfigGate.tsx) | In-app config form, validation, localStorage |
| [`src/ErrorPanel.tsx`](src/ErrorPanel.tsx) | Canonical error UI (Reset / Retry / Continue) |
| [`src/routes/Showcase.tsx`](src/routes/Showcase.tsx) | Dashboard + Metric + Visualization + Apply Filter |
| [`src/routes/Agent.tsx`](src/routes/Agent.tsx) | AnalyticsAgent (lazy-loaded) |
| [`src/lib/config.ts`](src/lib/config.ts) | `loadConfig`, `saveConfig`, `validateConfig` |
| [`src/lib/initSdkOnce.ts`](src/lib/initSdkOnce.ts) | Singleton init guard for `initializeAnalyticsSdk` |
| [`src/lib/messages.ts`](src/lib/messages.ts) | Canonical error copy |
| [`test/smoke.test.tsx`](test/smoke.test.tsx) | 5-case smoke suite (SDK mocked) |

## Notes

- This example uses the **class API** (`new AnalyticsDashboard(...)`).
  The Vanilla example demonstrates the alternative HTML custom-element
  surface (`<analytics-dashboard>`).
- `vite.config.ts` uses `base: './'` for portable deploys; relative URLs
  work under any sub-path.
- React 19 specific idioms in use: `useId()` for form IDs, native
  `<title>` in components (no `react-helmet`), and `ref` as a normal prop.

← [Back to repo root](../../README.md)

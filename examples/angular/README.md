# Angular 17 — Analytics Embedding SDK example

A runnable example of `@salesforce/analytics-embedding-sdk` using Angular 17
standalone components, signals, and the new control-flow syntax.

## Run locally

```bash
npm install
npm start
# Open http://localhost:4200
```

The first time you open the app you'll be redirected to `/setup`. Paste your
`https://yourorg.lightning.force.com` URL and a frontdoor URL, then click
**Save and connect**.

> Need a frontdoor URL? See [`docs/how-to-get-frontdoor-url.md`](../../docs/how-to-get-frontdoor-url.md) at the repo root.

## Build for production

```bash
npm run build      # outputs dist/ with --base-href ./
```

The build uses `--base-href ./` so the bundle is portable to any sub-path
(GitHub Pages `/angular/`, root `/`, custom prefix). Combined with hash
location strategy (`withHashLocation()` in `app.config.ts`), the deploy
needs no server-side rewrite rules.

## Scripts

| Script | Purpose |
|---|---|
| `npm start` | `ng serve` dev server |
| `npm run build` | `ng build --base-href ./` |
| `npm run lint` | ESLint on TypeScript + templates |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Jest smoke suite (SDK mocked) |

## What this example teaches

- How to gate routes with a **functional `canActivate` guard** that reads
  signal-backed state from a service (`ConfigGuard` → `ConfigService`).
- How to integrate the SDK's class API with Angular's `ngAfterViewInit` /
  `ngOnDestroy` lifecycle (mount via `@ViewChild` element ref, dispose on
  destroy).
- How to use **signals** for the init state machine — read in templates
  with `state()` and bound conditionals via `@if`.
- How to lazy-load a route with `loadComponent` (analogous to
  `React.lazy`).
- How to make an Angular SPA deploy cleanly to GitHub Pages without server
  rewrites (hash location + `--base-href ./`).

## Files of interest

| File | Why |
|---|---|
| [`src/app/app.component.ts`](src/app/app.component.ts) | Top-level shell; reads init state via signals |
| [`src/app/app.config.ts`](src/app/app.config.ts) | Standalone bootstrap; provider list |
| [`src/app/app.routes.ts`](src/app/app.routes.ts) | Routes with `loadComponent` + `canActivate` |
| [`src/app/config.service.ts`](src/app/config.service.ts) | Signals; localStorage; init-once guard |
| [`src/app/config.guard.ts`](src/app/config.guard.ts) | Functional `canActivate` |
| [`src/app/error-panel.component.ts`](src/app/error-panel.component.ts) | Canonical error UI |
| [`src/app/routes/setup.component.ts`](src/app/routes/setup.component.ts) | In-app config form |
| [`src/app/routes/showcase.component.ts`](src/app/routes/showcase.component.ts) | Dashboard + Metric + Visualization + Apply Filter |
| [`src/app/routes/agent.component.ts`](src/app/routes/agent.component.ts) | AnalyticsAgent (lazy-loaded) |
| [`src/app/config.service.spec.ts`](src/app/config.service.spec.ts) | 6-case Jest smoke suite |

## Notes

- This example uses the SDK's **class API**. The Vanilla example shows the
  alternative HTML custom-element surface.
- Setup component does **not** show the shell header — the header is gated
  on `config()` so it appears only after Save.
- Signals replace the older `BehaviorSubject` + `async` pipe pattern for
  this kind of single-shot reactive state.

← [Back to repo root](../../README.md)

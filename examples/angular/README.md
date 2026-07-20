# Angular 22 — Analytics Embedding SDK example

A runnable example of `@salesforce/analytics-embedding-sdk` using Angular 22
standalone components, signals, and `@if` control-flow syntax.

## Run locally

```bash
npm ci
npm start
# Open http://localhost:8500
```

The first time you open the app you'll be redirected to `/setup`. Enter your
org URL, at least one asset ID or API name, and a fresh frontdoor URL, then click
**Connect**. The configuration remains in memory and is discarded on reload.

> Need a frontdoor URL? See [`docs/how-to-get-frontdoor-url.md`](../../docs/how-to-get-frontdoor-url.md) at the repo root.

## Build for production

```bash
npm run build      # outputs dist/
```

## Scripts

| Script | Purpose |
|---|---|
| `npm start` | `ng serve` dev server |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | ESLint on TypeScript + templates |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest smoke suite via `@angular/build:unit-test` (SDK mocked) |

## What this example teaches

- How to gate routes with a **functional `canActivate` guard** that reads
  signal-backed state from a service (`configGuard` → `ConfigService`).
- How to integrate the SDK's class API with Angular's `ngAfterViewInit` /
  `ngOnDestroy` lifecycle (mount via `@ViewChild` element ref, `.remove()` on
  destroy).
- How to use **signals** for the init state machine — read in templates
  with `state()` and bound conditionals via `@if`.
- How to initialize the SDK **once in the shell** (an `effect` in
  `AppComponent`) and gate the `<router-outlet>` on a ready session, so route
  components mount assuming init succeeded — the same shape as the React
  example's gated `<Outlet>`.
- How to lazy-load a route with `loadComponent` (analogous to
  `React.lazy`).

## Files of interest

| File | Why |
|---|---|
| [`src/app/app.component.ts`](src/app/app.component.ts) | Top-level shell; reads init state via signals |
| [`src/app/app.config.ts`](src/app/app.config.ts) | Standalone bootstrap; provider list |
| [`src/app/app.routes.ts`](src/app/app.routes.ts) | Routes with `loadComponent` + `canActivate` |
| [`src/app/config.service.ts`](src/app/config.service.ts) | Memory-only config signal and init-once guard |
| [`src/app/config.guard.ts`](src/app/config.guard.ts) | Functional `canActivate` |
| [`src/app/error-panel.component.ts`](src/app/error-panel.component.ts) | Canonical error UI |
| [`src/app/routes/setup.component.ts`](src/app/routes/setup.component.ts) | In-app config form |
| [`src/app/routes/showcase.component.ts`](src/app/routes/showcase.component.ts) | Dashboard + Metric + Visualization |
| [`src/app/routes/agent.component.ts`](src/app/routes/agent.component.ts) | AnalyticsAgent (lazy-loaded) |
| [`src/app/config.service.spec.ts`](src/app/config.service.spec.ts) | Vitest unit tests for config/init logic |
| [`src/app/app.component.spec.ts`](src/app/app.component.spec.ts) | Vitest tests for shell outlet gating (init → ready) |

## Notes

- This example uses the SDK's **class API**. The Vanilla example shows the
  alternative HTML custom-element surface.
- Setup component does **not** show the shell header — the header is gated
  on `config()` so it appears only after Connect.
- Signals replace the older `BehaviorSubject` + `async` pipe pattern for
  this kind of single-shot reactive state.
- Enter at least one asset ID or API name in the setup form before connecting.
  Complete the repository's
  [Salesforce prerequisites](../../docs/prerequisites.md) first.

← [Back to repo root](../../README.md)

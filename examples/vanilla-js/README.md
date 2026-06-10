# Vanilla JS — Analytics Embedding SDK example

A no-build example of `@salesforce/analytics-embedding-sdk` using the SDK's
**HTML custom-element API**. Plain HTML + ES modules, served as static
files. The SDK loads from a CDN at runtime — there is no `package.json`
runtime dependency on the SDK at all.

## Run locally

```bash
npx serve . -l 8500
# Open http://localhost:8500
```

That's it. No `npm install` needed for runtime — only for linting and the
smoke test (`npm install && npm test`).

## How routing works

There is no client-side router. Each page is a separate HTML file:

| URL | File | Purpose |
|---|---|---|
| `/` | `index.html` | Setup form (paste org URL + frontdoor URL) |
| `/showcase.html` | `showcase.html` | Dashboard + Metric + Visualization |
| `/agent.html` | `agent.html` | AnalyticsAgent |

Each non-setup page calls `redirectIfUnconfigured()` first — if
`localStorage` is empty it bounces back to `/`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Static-file server on port 8500 |
| `npm run lint` | ESLint on `js/` and `test/` |
| `npm run typecheck` | `tsc --noEmit` with `checkJs: true` (TypeScript checks JSDoc types) |
| `npm test` | Vitest smoke suite |

## What this example teaches

- How to embed Tableau Next analytics with **zero build tooling** —
  ES modules + the SDK CDN bundle.
- How to use the SDK's **HTML custom-element API**:
  `<analytics-dashboard id-or-api-name="...">` upgrades automatically once
  the module loads.
- How to ship a tight Content-Security-Policy meta tag tuned for the SDK +
  Salesforce origins (see `<head>` of each HTML file).
- How to keep the same persistence + error-recovery UX as the React /
  Angular examples, written in 200 lines of vanilla DOM code.

## Files of interest

| File | Why |
|---|---|
| [`index.html`](index.html) | Setup form + CSP baseline |
| [`showcase.html`](showcase.html) | `<analytics-dashboard>` + `<analytics-metric>` + `<analytics-visualization>` |
| [`agent.html`](agent.html) | `<analytics-agent>` |
| [`js/sdk-cdn.js`](js/sdk-cdn.js) | Single source of truth for the CDN URL |
| [`js/init.js`](js/init.js) | Singleton SDK init guard |
| [`js/config.js`](js/config.js) | `loadConfig`, `validateConfig`, redirect helper |
| [`js/error-panel.js`](js/error-panel.js) | Canonical error UI (DOM-built, no innerHTML) |
| [`js/nav.js`](js/nav.js) | Shared header injector |
| [`test/smoke.test.js`](test/smoke.test.js) | 6-case smoke suite (jsdom) |

## Notes

- The Vanilla example uses the **HTML custom-element** SDK surface. The
  React + Angular examples demonstrate the alternative class API
  (`new AnalyticsDashboard({ container, idOrApiName })`).
- `<link rel="modulepreload">` on the setup page warms the SDK module so
  init feels instant after Save.
- All UI is built with `document.createElement` + `textContent` — no
  `innerHTML`, no inline event handlers, no `eval`.

← [Back to repo root](../../README.md)

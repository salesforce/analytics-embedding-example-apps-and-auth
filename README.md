# Salesforce Analytics Embedding SDK — Example Apps

[License: Apache 2.0](LICENSE.txt)
[SDK: @salesforce/analytics-embedding-sdk](https://www.npmjs.com/package/@salesforce/analytics-embedding-sdk)
[Live demos: GitHub Pages](https://salesforce.github.io/analytics-embedding-example-apps-and-auth/)

Canonical, framework-spanning example apps for embedding **Tableau Next**
analytics — Dashboards, Metrics, Visualizations, and the AnalyticsAgent —
into your own web application using
`[@salesforce/analytics-embedding-sdk](https://www.npmjs.com/package/@salesforce/analytics-embedding-sdk)`.

Each example is a standalone, runnable project that covers the same scenarios
in idiomatic React 19, plain Vanilla JS, and Angular 17. Fork the directory
that matches your stack, swap in your org's IDs, and ship.

## What this repo is

- A **single source of truth** for embedding Tableau Next analytics across
major frontend stacks. Three examples — same scenarios, same UX, different
frameworks.
- A **reference implementation** of the recoverable error UX, lifecycle
cleanup, and accessibility patterns that production embeds need.
- A **discovery surface** for both human developers and AI assistants
searching for canonical embedding examples (see `llms.txt`).

This repo is *phase 1* and ships UI-only example apps. Backend samples for
OAuth → frontdoor exchange land in *phase 2* under `auth-backend/`.

## Examples


| Stack                      | Live demo                                                                                  | Source                                         | What it spotlights                                                |
| -------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------------- |
| **React 19 + Vite 6 + TS** | [demo](https://salesforce.github.io/analytics-embedding-example-apps-and-auth/react-vite/) | `[examples/react-vite/](examples/react-vite/)` | Modern SPA — class API, lazy routes, hooks                        |
| **Vanilla JS (no build)**  | [demo](https://salesforce.github.io/analytics-embedding-example-apps-and-auth/vanilla-js/) | `[examples/vanilla-js/](examples/vanilla-js/)` | Static page / CMS embed — HTML custom-element API, CDN-loaded SDK |
| **Angular 17**             | [demo](https://salesforce.github.io/analytics-embedding-example-apps-and-auth/angular/)    | `[examples/angular/](examples/angular/)`       | Enterprise app — standalone components, signals, DI               |


Each example demonstrates the same five scenarios: a **Showcase** page with a
Dashboard + Metric + Visualization on one screen, an **Agent** route with the
AnalyticsAgent, an **Apply Filter** interaction, an **in-app config form**
that persists `orgUrl` + `authCredential` to `localStorage`, and a
**recoverable error UX** for expired sessions and MFA prompts.

## Quickstart

> **All three quickstarts have the same shape.** Pick the one matching your
> stack — the other two read identically.

### React 19 + Vite

```bash
git clone https://github.com/salesforce/analytics-embedding-example-apps-and-auth.git
cd analytics-embedding-example-apps-and-auth/examples/react-vite
npm install
npm run dev
# Open http://localhost:5173 — paste your org URL + frontdoor URL into the form.
```

The first time you open the app you'll see a config form. Paste your
`https://yourorg.lightning.force.com` URL and a frontdoor URL (see the auth
section below), click **Save**, and the Showcase route renders.

### Vanilla JS

```bash
git clone https://github.com/salesforce/analytics-embedding-example-apps-and-auth.git
cd analytics-embedding-example-apps-and-auth/examples/vanilla-js
npx serve .
# Open the printed URL — no build step needed.
```

The Vanilla example loads the SDK directly from a CDN. There is no
`package.json` runtime dependency on the SDK at all — the only npm scripts
exist for linting and the smoke test.

### Angular 17

```bash
git clone https://github.com/salesforce/analytics-embedding-example-apps-and-auth.git
cd analytics-embedding-example-apps-and-auth/examples/angular
npm install
npm start
# Open http://localhost:4200 — paste your org URL + frontdoor URL.
```

The Angular example uses standalone components and the `@if`/`@for`
control-flow syntax. The `ConfigGuard` keeps the Showcase and Agent routes
gated until config is present.

## How does authentication work?

In phase 1 the example apps accept a Salesforce **frontdoor URL** as
`authCredential`. A frontdoor URL is a short-lived redirect that establishes
a Salesforce session in a browser. You obtain one out of band (manually for
demos, or via your own backend in production) and paste it into the in-app
config form. The example stores it in `localStorage` only on your machine.

A frontdoor URL grants whatever access the underlying session has — treat it
like a password and use a **sandbox org** for demos. For step-by-step
instructions on getting one, see
`[docs/how-to-get-frontdoor-url.md](docs/how-to-get-frontdoor-url.md)`.

In phase 2 we will add backend samples under `auth-backend/` that mint
frontdoor URLs server-side from OAuth refresh tokens, so production apps
never expose a long-lived credential to the browser.

## FAQ

### How do I embed a Tableau Next dashboard in React?

The shortest path is to fork `[examples/react-vite/](examples/react-vite/)`.
The `Showcase.tsx` route shows the canonical pattern: import
`AnalyticsDashboard` from the SDK, mount it inside a `ref`'d `<div>` in a
`useEffect`, and call `dispose()` in the cleanup. See
`[examples/react-vite/src/routes/Showcase.tsx](examples/react-vite/src/routes/Showcase.tsx)`.

### How do I authenticate without a backend?

For demos, paste a frontdoor URL obtained from a sandbox org — the Phase 1
auth model. See `[docs/how-to-get-frontdoor-url.md](docs/how-to-get-frontdoor-url.md)`.
For production, you need a backend that mints frontdoor URLs from OAuth
tokens (Phase 2 of this repo).

### What is a frontdoor URL?

A short-lived, single-use redirect that establishes a Salesforce session in a
browser without going through the standard login flow. Inherits the lifetime
of the underlying session (typically 2 hours). Treat it like a password.

### How do I apply filters programmatically?

Each example has an **Apply Filter** button on the Showcase page that calls
the SDK's `applyFilters` API on the embedded dashboard instance. See
`Showcase.tsx` (React), `showcase.html` (Vanilla), or
`showcase.component.ts` (Angular).

### How do I embed the Agentforce analytics agent?

Each example has a separate `/agent` route (Vanilla: `agent.html`) that
mounts `AnalyticsAgent`. The route is lazy-loaded in React (`React.lazy`)
and Angular (`loadComponent`) to keep the initial bundle small.

### Does this work with Next.js / Remix / Vue / Svelte?

Yes — the SDK is framework-agnostic. The React example's pattern (mount in
an effect, dispose on unmount) ports to any view layer. The Vanilla example
shows the lowest-friction surface (HTML custom element) which embeds in any
HTML host without a framework at all.

### Is this production-ready?

The UI patterns are. The auth model is **not** — frontdoor URLs are a demo
shortcut. Production apps need a backend that mints them server-side, which
we ship in phase 2.

### Where do I report issues?

[GitHub Issues](https://github.com/salesforce/analytics-embedding-example-apps-and-auth/issues)

## Project layout

```
analytics-embedding-example-apps-and-auth/
├── README.md                       # This file (SSOT)
├── llms.txt                        # AI-scanner manifest
├── examples/
│   ├── react-vite/                 # React 19 + Vite 6 + TS
│   ├── vanilla-js/                 # Plain HTML + ES modules
│   └── angular/                    # Angular 17 standalone
├── docs/
│   ├── how-to-get-frontdoor-url.md
│   └── seo/screenshots/
└── .github/workflows/              # CI matrix + GH Pages deploy
```

The `auth-backend/` directory is reserved for phase 2 and intentionally not
present yet.

## Contributing

See `[CONTRIBUTING.md](CONTRIBUTING.md)` for the contribution workflow and
`[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)` for community expectations.

## Security

To report a security issue, see `[SECURITY.md](SECURITY.md)`. Please do not
file security issues as public GitHub issues.

## License

Apache 2.0 — see `[LICENSE.txt](LICENSE.txt)`.
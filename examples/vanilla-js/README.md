# Vanilla JavaScript — Analytics Embedding SDK example

A no-build Analytics Embedding SDK 2.0 example using HTML custom elements,
plain HTML, and ES modules. The runtime SDK is loaded from an exact CDN URL.

## Run locally

```bash
npx --yes serve@14.2.6 . -l 8500
# Open http://localhost:8500
```

No project dependency installation is required to run the example. Run
`npm ci` only when you want to lint, typecheck, or test the repository code.

Before connecting, enter at least one asset ID or API name in the setup form and
complete the repository's
[Salesforce prerequisites](../../docs/prerequisites.md).

## One-document navigation

Setup, Showcase, and Agent are views in `index.html`. The `#showcase` and
`#agent` hashes switch views without loading another document. This matters
because the frontdoor URL is held only in memory and the SDK is initialized
once per page load.

After a reload or **Reset config**, the credential is gone and setup is shown
again.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Static-file server on port 8500 |
| `npm run lint` | ESLint on `js/` and `test/` |
| `npm run typecheck` | TypeScript checks JavaScript via JSDoc |
| `npm test` | Vitest smoke suite |

## What this example teaches

- loading SDK 2.0 from a pinned CDN module without build tooling;
- using HTML custom elements for dashboards, metrics, and visualizations, and
  the class API for `AnalyticsAgent`;
- attaching SDK events before template content enters the live document;
- initializing once while navigating between views;
- retaining the demo credential in memory only; and
- handling success, repeated `AUTH_REDIRECT`, terminal retry failure, and
  component render errors.

## Files of interest

| File | Why |
|---|---|
| [`index.html`](index.html) | Setup, navigation, embed templates, and CSP baseline |
| [`js/app.js`](js/app.js) | In-memory setup, init/retry state machine, view switching |
| [`js/sdk-cdn.js`](js/sdk-cdn.js) | Pinned SDK CDN URL |
| [`js/init.js`](js/init.js) | Singleton SDK initialization and redirect parsing |
| [`js/config.js`](js/config.js) | Config validation |
| [`js/error-panel.js`](js/error-panel.js) | Safe DOM-built recovery UI |
| [`test/smoke.test.js`](test/smoke.test.js) | Validation and auth-recovery tests |

The React and Angular examples demonstrate the alternative SDK class API.

The Vanilla Agent route also uses the class API because `AnalyticsAgent`
requires constructor properties. The other three components remain HTML
custom-element examples.

← [Back to repo root](../../README.md)

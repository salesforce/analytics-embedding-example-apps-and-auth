# Salesforce Analytics Embedding SDK — Example Apps

[License: Apache 2.0](LICENSE.txt) ·
[SDK package](https://www.npmjs.com/package/@salesforce/analytics-embedding-sdk) ·
[Official SDK documentation](https://developer.salesforce.com/docs/analytics/sdk/guide/sdk-overview.html)

Reference frontend apps for embedding Tableau Next dashboards, metrics,
visualizations, and AnalyticsAgent with **Analytics Embedding SDK 2.0**.
The same scenarios are implemented in React, Vanilla JavaScript, and Angular.

This repository's current scope is frontend integration plus a local
development utility for generating test credentials. A production
authentication service is intentionally out of scope.

## Examples

| Stack | Source | API style |
|---|---|---|
| React 19 + Vite 8 + TypeScript | [examples/react-vite/](examples/react-vite/) | SDK classes, hooks, lazy route |
| Vanilla JavaScript | [examples/vanilla-js/](examples/vanilla-js/) | CDN module, HTML custom elements, no build step |
| Angular 22 | [examples/angular/](examples/angular/) | SDK classes, signals, dependency injection |

Every example includes:

- a Showcase view with a dashboard, metric, and visualization;
- an AnalyticsAgent view;
- one-time SDK initialization;
- `AUTH_REDIRECT` recovery with `retryOrAddOrgs`;
- runtime error handling and component cleanup; and
- an in-app demo form that keeps the credential **in memory only**.

Reloading or resetting an example discards the credential and requires a
fresh frontdoor URL.

## Before you start

Complete the [Salesforce prerequisites](docs/prerequisites.md) first. In
particular, you need:

- an appropriately licensed Salesforce org with Tableau Next enabled;
- access to each embedded analytics asset;
- the example origin in the org's CORS allowlist and embedding/trusted-domain
  settings;
- a supported browser configured to allow the cookies required by the embed;
- API names for a dashboard, metric, visualization, and AnalyticsAgent; and
- a freshly generated frontdoor URL from an approved OAuth/UI Bridge flow
  (the included local utility can perform this flow for test orgs).

Use a sandbox and a least-privileged user for these examples. Node.js
22.12 or newer is recommended for the repository's current tooling.

## Quickstart

First replace the placeholder asset names for your org:

- React: `src/routes/Showcase.tsx` and `src/routes/Agent.tsx`
- Vanilla: the templates in `index.html`
- Angular: `src/app/routes/showcase.component.ts` and
  `src/app/routes/agent.component.ts`

Then run one example.

### React

```bash
cd examples/react-vite
npm ci
npm run dev
```

Open `http://localhost:8500`.

### Vanilla JavaScript

```bash
cd examples/vanilla-js
npx serve . -l 8500
```

Open `http://localhost:8500`. The SDK loads directly from the pinned CDN URL
in `js/sdk-cdn.js`; installing packages is only necessary for repository
linting, typechecking, and tests.

### Angular

```bash
cd examples/angular
npm ci
npm start
```

Open `http://localhost:8500`.

## Authentication model

The SDK accepts a frontdoor URL as `authCredential`. For these local examples,
paste a fresh URL into the setup form. It is passed directly to
`initializeAnalyticsSdk`, never written to web storage, and removed from the
visible form immediately. See [the demo authentication guide](docs/how-to-get-frontdoor-url.md).

For a real application, use a backend OAuth 2.0 Web Server Flow and generate
the browser credential through Salesforce UI Bridge. Do not ask users to copy
session cookies and do not place refresh tokens or client secrets in frontend
code.

### Generate a URL for local testing

The zero-dependency [frontdoor URL utility](tools/frontdoor-url/) runs the
OAuth Web Server Flow with PKCE and calls UI Bridge from a localhost process:

```bash
cd tools/frontdoor-url
export SF_CLIENT_ID='your-external-client-app-consumer-key'
export SF_LOGIN_URL='https://your-domain.my.salesforce.com'
npm start
```

Your External Client App must allow `http://localhost:1717/callback` and the
`web` scope. The utility displays the one-time URL in the callback page; it
does not print or persist the access token or frontdoor URL. See the
[utility setup guide](tools/frontdoor-url/README.md) before running it.

## SDK lifecycle shown here

1. Collect `orgUrl` and a fresh `authCredential`.
2. Call `initializeAnalyticsSdk` once for the document.
3. Render assets only after `Status.SUCCESS`.
4. If an org reports `OrgStates.AUTH_REDIRECT`, open the returned verification
   URL and inspect the result of `retryOrAddOrgs`.
5. Subscribe to `EventName.ERROR` and remove SDK elements during framework
   cleanup.

The examples deliberately validate only that `orgUrl` is an HTTPS URL. Valid
Salesforce org hostnames vary, and the SDK/org response is the authority on
whether initialization is allowed.

## Project layout

```text
analytics-embedding-example-apps-and-auth/
├── docs/
│   ├── prerequisites.md
│   └── how-to-get-frontdoor-url.md
├── examples/
│   ├── react-vite/
│   ├── vanilla-js/
│   └── angular/
├── tools/
│   └── frontdoor-url/              # Local OAuth + UI Bridge helper
└── .github/workflows/
```

## Support and security

These are reference examples, not a supported product. Report defects through
[GitHub Issues](https://github.com/salesforce/analytics-embedding-example-apps-and-auth/issues).
For security reports, follow [SECURITY.md](SECURITY.md) and do not open a
public issue.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md) and
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Licensed under Apache 2.0; see
[LICENSE.txt](LICENSE.txt).

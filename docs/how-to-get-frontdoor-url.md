# How to get a frontdoor URL (for demo / development)

The example apps in this repo accept a Salesforce **frontdoor URL** as
`authCredential`. This document explains what that is, how to obtain one for a
sandbox org, and the security trade-offs involved.

> **For phase 2** of this repo, we will add backend samples that mint frontdoor
> URLs server-side from OAuth tokens. Until then, you obtain one manually.

## What is a frontdoor URL?

A frontdoor URL is a **short-lived, single-use redirect** that establishes a
Salesforce session in a browser without going through the standard login flow.
The URL looks like:

```
https://yourorg.lightning.force.com/secur/frontdoor.jsp?sid=<SESSION_ID>&retURL=<RETURN_PATH>
```

The Analytics Embedding SDK consumes this URL as `authCredential` and uses it
to bootstrap an authenticated session against the org named in `orgUrl`.

A frontdoor URL grants whatever access the underlying session has. **Treat it
like a password.**

## Step-by-step: get one from a sandbox org

These steps assume you have access to a Salesforce **sandbox** org. Do not
follow these steps with a production org.

1. Log in to your sandbox at `https://test.salesforce.com` (or your custom
   sandbox URL).
2. Switch to the Lightning Experience (the modern UI). Note the URL — it
   should look like `https://your-sandbox.lightning.force.com/...`. This is
   the value you paste as **Org URL** in the example apps.
3. Open your browser's developer tools → **Application** (Chrome/Edge) or
   **Storage** (Firefox) → **Cookies** for `*.lightning.force.com`.
4. Find the cookie named **`sid`**. Copy its value.
5. Build the frontdoor URL by concatenating:

   ```
   https://your-sandbox.lightning.force.com/secur/frontdoor.jsp?sid=<PASTE_SID_VALUE_HERE>
   ```

6. Paste the full URL as **Auth credential** in the example app.

That's it. The example will pass the URL to `initializeAnalyticsSdk` and the
SDK will use it to load embedded analytics assets.

## Why does it expire?

Frontdoor URLs inherit the lifetime of the underlying session. Sessions
typically last **2 hours** of inactivity, configurable per org. When the SDK
init returns `Status.FAILURE` with a session-related message, the URL has
expired — generate a fresh one and click **Reset config** in the example app.

If your org enforces multi-factor authentication and the session needs
re-verification, the SDK reports `OrgStates.AUTH_REDIRECT`. The example apps
handle this by showing a "Continue verification" button that opens the
returned URL in a new tab.

## Security considerations

- **Never paste a production frontdoor URL.** A leaked URL grants whoever
  holds it the same access as your session.
- **Use a sandbox org for demos.** Restrict the user's permissions to the
  minimum needed to view the embedded assets.
- **Do not commit URLs.** They are session credentials. The example apps
  store them only in `localStorage` on the developer's machine.
- **Use HTTPS for the host page.** The SDK refuses to load over HTTP for
  cross-origin reasons; the same rule should apply to whatever embeds it.
- **Rotate often during development.** Generate a new URL per work session
  rather than reusing a stale one.

## Phase 2 — backend-issued URLs

For real applications you do not paste frontdoor URLs by hand. A backend
exchanges a stored OAuth refresh token for a fresh frontdoor URL on demand
and serves it to the front end (typically via an authenticated `/api/auth`
endpoint). That backend lives outside the browser and never exposes the
refresh token to the client.

Phase 2 of this repo will add reference backend implementations under
`auth-backend/`. Until then, treat the in-app config form as a **demo
shortcut**, not a deployment pattern.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `INVALID_ORG_URL` in the form | Org URL isn't a full `https://` URL | Paste the complete URL including `https://`, e.g. `https://yourorg.lightning.force.com` |
| `INIT_FAILED` with "Session expired" | Frontdoor URL expired | Log in again, copy a new `sid`, paste a fresh URL |
| `AUTH_REDIRECT` in the UI | MFA / password reset required | Click "Continue verification", finish in the new tab, click "Retry" |
| Empty container, no error | Asset ID/API name wrong, or no permission on the asset | Verify the dashboard / metric / visualization exists in your org and the user has access |

## Further reading

- [Salesforce Analytics Embedding SDK on npm](https://www.npmjs.com/package/@salesforce/analytics-embedding-sdk)
- [Tableau Next embedded analytics docs (developer.salesforce.com)](https://developer.salesforce.com)

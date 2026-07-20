# Local frontdoor URL utility

This zero-dependency Node utility performs Salesforce OAuth 2.0 Web Server
Flow with PKCE, exchanges the access token through the Single Access UI Bridge
API, and displays the resulting frontdoor URL in a local browser page.

It is intended for developers testing the example apps with sandbox or test
orgs. It is not a production authentication service.

## One-time External Client App setup

Create or configure an External Client App in the org:

1. Enable OAuth and the Web Server Flow.
2. Add this exact callback URL:

   ```text
   http://localhost:1717/callback
   ```

3. Add the `web` OAuth scope.
4. Enable the PKCE policy if required by your organization. The utility always
   sends an S256 challenge and verifier.
5. If **Require Secret for Web Server Flow** is enabled, make the consumer
   secret available as `SF_CLIENT_SECRET`. Never pass it as a command-line
   argument or commit it.
6. Make sure the test user is assigned to the app, can access the embedded
   assets, and is not an API-only user.

Follow Salesforce's
[authentication setup](https://developer.salesforce.com/docs/analytics/sdk/guide/sdk-access-token.html)
and your organization's ECA policies.

## Run it

From this directory:

```bash
export SF_CLIENT_ID='your-external-client-app-consumer-key'
export SF_LOGIN_URL='https://your-domain.my.salesforce.com'
npm start
```

If the ECA requires a consumer secret, set `SF_CLIENT_SECRET` through your
shell's secure prompt, credential manager, or secret manager before running.
Avoid placing the secret directly in shell history.

The utility prints an authorization URL. Open it, sign in to the specified
org, and approve access. After Salesforce redirects to localhost, the page
displays the generated frontdoor URL with a copy button. Paste it immediately
into an example's **Frontdoor URL** field.

For a different callback port:

```bash
npm start -- --port 1818
```

Update the ECA callback URL to the exact same port. You can also pass
`--login-url` and `--client-id` explicitly; the secret is environment-only.

## Important URL distinction

- `SF_LOGIN_URL` is the org's **My Domain** URL, such as
  `https://your-domain.my.salesforce.com`. UI Bridge doesn't support
  `login.salesforce.com` or `test.salesforce.com`.
- The example app's `orgUrl` remains its Lightning URL, such as
  `https://your-domain.lightning.force.com`.

The utility checks HTTPS URL syntax but doesn't guess which Salesforce
hostname patterns are valid. Salesforce's OAuth and UI Bridge responses remain
the authority.

## Security behavior

- Binds the callback server to the local loopback interface only.
- Uses a random OAuth state value and PKCE S256.
- Keeps the authorization code, access token, consumer secret, and frontdoor
  URL in process memory only.
- Sends the access token to UI Bridge in the `Authorization` header.
- Uses `Cache-Control: no-store`, a restrictive CSP, and no referrer on the
  result page.
- Does not print the access token or frontdoor URL to the terminal.
- Stops after the first valid-state callback or after a five-minute timeout.

The generated frontdoor URL is valid for up to one minute and can be used only
once. Generate a new one after a reload or reset.

## Test

```bash
npm test
```

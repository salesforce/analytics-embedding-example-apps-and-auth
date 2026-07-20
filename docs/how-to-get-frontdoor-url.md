# Provide a frontdoor URL for the local demo

The example forms accept a Salesforce frontdoor URL as `authCredential`. This
is a sensitive, short-lived browser credential. The repository includes a
localhost OAuth/UI Bridge utility for test orgs and does not ask you to extract
a Salesforce session cookie.

## Recommended flow

For a real integration:

1. Implement the Salesforce
   [OAuth 2.0 Web Server Flow](https://developer.salesforce.com/docs/analytics/sdk/guide/sdk-access-token.html)
   in a trusted backend.
2. Keep the client secret, refresh token, and token exchange on that backend.
3. Use Salesforce UI Bridge to issue the single-access frontdoor URL for the
   browser. Review the
   [UI Bridge single-access documentation](https://help.salesforce.com/s/articleView?id=xcloud.frontdoor_singleaccess.htm&language=en_US&type=5)
   for its current lifetime and consumption rules.
4. Deliver the fresh URL to your authenticated frontend over HTTPS and pass it
   directly to `initializeAnalyticsSdk`.

The same architecture applies if your organization already has an approved
service or internal tool that produces frontdoor URLs.

## Using these examples locally

For local sandbox testing, use your approved OAuth/UI Bridge implementation or
configure the repository's [frontdoor URL utility](../tools/frontdoor-url/README.md).
The included tool uses OAuth Web Server Flow with PKCE and calls
`/services/oauth2/singleaccess` server-side.

After generating a fresh URL:

1. Open an example at `http://localhost:8500`.
2. Enter the Lightning org URL in **Org URL**.
3. Paste the newly issued URL into **Frontdoor URL**.
4. Select **Connect** immediately.

The utility displays the value in a no-store localhost page and doesn't print
it to the terminal. After you paste it, the example holds the value in
JavaScript memory only. It is not stored in
`localStorage`, `sessionStorage`, cookies, or a source file. The Vanilla
example uses a single HTML document so changing between Showcase and Agent
does not require the one-time URL again. A reload or **Reset config** discards
the value and returns to setup.

## Security rules

- Use a sandbox and a least-privileged test user for the examples.
- Never commit, log, screenshot, or share a frontdoor URL.
- Never put OAuth client secrets or refresh tokens in frontend code.
- Generate the URL immediately before use. A UI Bridge single-access URL can
  be consumed only once and is valid for a very short period (currently up to
  one minute; confirm in the linked Salesforce documentation).
- Serve production applications over HTTPS and protect the endpoint that
  supplies browser credentials with your application's own authorization.

## Additional verification and retry

The SDK can return an org state of `OrgStates.AUTH_REDIRECT`, for example when
additional verification is required. Each example:

1. opens the SDK-provided continuation URL in a new tab;
2. asks the user to finish verification; and
3. calls `retryOrAddOrgs` when **Retry** is selected.

The retry response is handled like the initial response: success renders the
embed, another redirect is shown again, and a terminal failure remains visible
with a reset action.

## Troubleshooting

| Symptom | What to check |
|---|---|
| Form rejects the org URL | Include `https://` and use the Lightning org URL. |
| Initialization reports an expired or invalid credential | Generate a new single-access URL and connect immediately. |
| Additional verification panel appears | Complete the supplied verification URL, return, and select **Retry**. |
| Asset container fails to render | Replace the placeholder API name, confirm user access, CORS, trusted-domain settings, and browser cookie settings. |

Also complete the [Salesforce prerequisites](prerequisites.md) and consult the
[Analytics Embedding SDK overview](https://developer.salesforce.com/docs/analytics/sdk/guide/sdk-overview.html).

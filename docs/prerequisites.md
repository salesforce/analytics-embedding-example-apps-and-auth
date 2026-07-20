# Salesforce prerequisites

Complete this checklist before running an example. The frontend can only
embed assets after the Salesforce org, user, and browser are configured.

## 1. Org and user access

- Use an org with Tableau Next enabled and a supported license, as described
  in [Set Up Your Salesforce Org](https://developer.salesforce.com/docs/analytics/sdk/guide/sdk-setup-sfdc.html).
- Assign the user the permissions needed to view each dashboard, metric,
  visualization, or AnalyticsAgent that you plan to embed.
- Use a sandbox and a least-privileged test user while evaluating these apps.

## 2. Allow the host application

- Add the exact host origin to the org's
  [CORS allowlist](https://developer.salesforce.com/docs/analytics/sdk/guide/sdk-cors.html).
  For the default local setup, that origin is `http://localhost:8500`.
- Configure the host under the Salesforce embedding and trusted-domain
  settings described in
  [Configure Settings for Embedding](https://developer.salesforce.com/docs/analytics/sdk/guide/sdk-setup-settings.html).
- Repeat these settings for every deployment origin. Scheme, hostname, and
  port are significant; a production origin is not interchangeable with
  localhost.

## 3. Browser requirements

Follow the current
[browser and cookie requirements](https://developer.salesforce.com/docs/analytics/sdk/guide/sdk-browser-requirements.html).
Privacy extensions, tracking prevention, and blocked third-party cookies can
prevent the embedded Salesforce session from being established.

## 4. Asset API names

Obtain the API name or identifier for the assets you want to test and enter
them in the example's setup form. At least one asset is required:

| Asset | Example input |
|---|---|
| Dashboard | `YourDashboardApiName` |
| Metric | `YourMetricApiName` |
| Visualization | `YourVisualizationApiName` |
| AnalyticsAgent | `YourAnalyticsAgentApiName` |

See [Initialize and Embed](https://developer.salesforce.com/docs/analytics/sdk/guide/sdk-integration-initialize-embed.html)
for the current component configuration. The authenticated user must have
access to the selected assets.

## 5. Authentication input

Prepare:

- the Lightning org URL used as `orgUrl`; and
- a fresh frontdoor URL generated through an approved OAuth/UI Bridge flow,
  used as `authCredential`. For sandbox testing, you can configure and run the
  repository's [local frontdoor URL utility](../tools/frontdoor-url/README.md).

The local forms retain the credential only in JavaScript memory. Generate the
URL immediately before connecting, do not log or commit it, and expect to
generate another after a reload. See [the authentication guide](how-to-get-frontdoor-url.md).

## 6. Local tooling

- Node.js 22.12 or newer for the current React, Angular, and test toolchains.
- Port 8500 available, or update both the dev-server port and the matching
  Salesforce allowlist entries.

Finally, review Salesforce's
[embedding best practices](https://developer.salesforce.com/docs/analytics/sdk/guide/sdk-integration-best-practices.html)
before adapting an example for production.

## Security

Please report any security issue to [security@salesforce.com](mailto:security@salesforce.com)
as soon as it is discovered. Do not file security issues as public GitHub issues.

These are **example apps**, not a supported product. They keep their dependencies
minimal, but you are responsible for reviewing all third-party packages and their
transitive dependencies before using any of this code in your own application.

One security note specific to these examples: the Phase 1 auth model has you
paste a Salesforce **frontdoor URL** into an in-app form, stored only in your
browser's `localStorage`. A frontdoor URL is a session credential — treat it
like a password, use a **sandbox org** for demos, and never commit one. See
[`docs/how-to-get-frontdoor-url.md`](docs/how-to-get-frontdoor-url.md) for
details.
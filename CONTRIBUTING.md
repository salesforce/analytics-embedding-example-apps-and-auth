# Contributing

Thanks for your interest in the Salesforce Analytics Embedding SDK example apps.

## Governance: published, not actively supported

This repository is published because the example apps contain useful, canonical
patterns for embedding Tableau Next analytics that we want to share with the
community. It is **not** an actively-staffed product. We do occasional
maintenance — keeping the examples building against current SDK and framework
releases — but we are not soliciting feature contributions and may be slow to
respond to issues and pull requests.

That said, fixes that keep the examples correct and runnable are welcome.

## Good contributions

- **Bug fixes** where an example doesn't build, lint, typecheck, or run.
- **Doc corrections** where the README, `llms.txt`, or inline comments are wrong
  or out of date relative to the code.
- **Dependency / compatibility fixes** when a new React, Angular, Vite, or SDK
  release breaks an example.
- **Cross-example consistency fixes** — all three examples are meant to mirror
  the same scenarios; a change to one often implies the same change to the
  others.

## Less likely to be accepted

- New frameworks or new example apps (the three here are intentional and
  scoped).
- New scenarios beyond the current set (Showcase, Agent, in-app
  config, recoverable error UX).
- Restyling or design-system additions — the examples ship deliberately minimal,
  replaceable baseline styles.

If you're unsure whether a change fits, open an issue first rather than
investing time in a large pull request.

## Before you open a pull request

Each example is standalone. From the example's directory
(`examples/react-vite`, `examples/vanilla-js`, or `examples/angular`):

```bash
npm ci          # reproducible install from the committed package-lock.json
npm run lint
npm run typecheck
npm test
npm run build   # react-vite and angular only; vanilla-js has no build step
```

These are the same checks CI runs (see `.github/workflows/ci.yml`). A pull
request that doesn't pass them won't be merged.

Each example commits its `package-lock.json`. If you change dependencies, run
`npm install` to update the lock file and commit it alongside your change.
Keep changes small and focused — if you change behavior in one example, apply
the equivalent change to the others so they stay in sync.

## Reporting issues

Use [GitHub Issues](https://github.com/salesforce/analytics-embedding-example-apps-and-auth/issues)
for bugs and questions. Please include the example (React / Vanilla / Angular),
your Node version, and steps to reproduce.

Do **not** file security issues as public GitHub issues — see
[SECURITY.md](SECURITY.md).

## Contributor License Agreement (CLA)

All external contributions require a signed Salesforce CLA. You only need to
sign once to contribute to any Salesforce open-source project. You'll be
prompted automatically when you open your first pull request, or you can sign
ahead of time at <https://cla.salesforce.com/sign-cla>.

## Code of Conduct

Participation in this project is governed by the
[Salesforce Open Source Community Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the
[Apache License 2.0](LICENSE.txt) that covers this project.

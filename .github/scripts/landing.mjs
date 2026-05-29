// Generates dist/index.html — a static landing page that mirrors the
// README's example table. Doubles as a sitemap for the deployed examples.
//
// Run from repo root: `node .github/scripts/landing.mjs`. Reads no env
// variables and writes a single file.

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const examples = [
  {
    slug: 'react-vite',
    name: 'React 19 + Vite 6',
    description: 'Modern SPA — class API, lazy routes, hooks, TypeScript strict.',
  },
  {
    slug: 'vanilla-js',
    name: 'Vanilla JS',
    description: 'No build, ES modules, HTML custom-element API, CDN-loaded SDK.',
  },
  {
    slug: 'angular',
    name: 'Angular 17',
    description: 'Standalone components, signals, functional guards, DI.',
  },
];

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Salesforce Analytics Embedding SDK — Example Apps</title>
    <meta
      name="description"
      content="Live demos of @salesforce/analytics-embedding-sdk in React 19, Vanilla JS, and Angular 17. Same scenarios, different stacks."
    />
    <style>
      :root { color-scheme: light dark; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      body { max-width: 760px; margin: 3rem auto; padding: 0 1rem; line-height: 1.6; }
      h1 { margin-bottom: 0; }
      .lede { color: #5f6b7a; margin-top: 0.25rem; }
      ul { list-style: none; padding: 0; }
      li { padding: 1rem; border: 1px solid #d8dde6; border-radius: 8px; margin: 0.75rem 0; }
      li a { font-weight: 600; text-decoration: none; }
      li p { margin: 0.25rem 0 0; color: #5f6b7a; }
      footer { margin-top: 3rem; color: #5f6b7a; font-size: 0.9rem; }
    </style>
  </head>
  <body>
    <h1>Salesforce Analytics Embedding SDK</h1>
    <p class="lede">
      Live example apps for embedding Tableau Next analytics in React, Vanilla
      JS, and Angular.
    </p>
    <ul>
${examples
  .map(
    (e) =>
      `      <li><a href="./${e.slug}/">${e.name}</a><p>${e.description}</p></li>`,
  )
  .join('\n')}
    </ul>
    <footer>
      <p>
        Source on
        <a href="https://github.com/salesforce/analytics-embedding-example-apps-and-auth">
          GitHub
        </a>
        · Apache 2.0 licensed.
      </p>
    </footer>
  </body>
</html>
`;

// Anchor relative to this script so the workflow can run it from any cwd.
const out = fileURLToPath(new URL('../../dist/index.html', import.meta.url));
await writeFile(out, html, 'utf8');
console.info(`wrote ${out}`);

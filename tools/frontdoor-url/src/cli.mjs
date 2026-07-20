#!/usr/bin/env node
import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import {
  createAuthorizationUrl,
  createPkce,
  exchangeAuthorizationCode,
  generateFrontdoorUrl,
  normalizeLoginUrl,
} from './salesforce.mjs';
import { renderErrorPage, renderSuccessPage } from './page.mjs';

const HELP = `Usage:
  SF_CLIENT_ID=<consumer-key> [SF_CLIENT_SECRET=<secret>] npm start -- \\
    --login-url https://your-domain.my.salesforce.com

Options:
  --login-url <url>     My Domain URL used for OAuth (or SF_LOGIN_URL)
  --client-id <id>      External Client App consumer key (or SF_CLIENT_ID)
  --port <number>       Local callback port (default: 1717)
  --redirect-uri <path> Optional relative Salesforce path after bridging
  --help                Show this help

The optional ECA consumer secret is read only from SF_CLIENT_SECRET.
`;

function parseArgs(argv, env = process.env) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help') return { help: true };
    if (!arg.startsWith('--')) throw new Error(`Unknown argument: ${arg}`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
    values.set(arg, value);
    index += 1;
  }

  const allowed = new Set(['--login-url', '--client-id', '--port', '--redirect-uri']);
  for (const key of values.keys()) {
    if (!allowed.has(key)) throw new Error(`Unknown option: ${key}`);
  }

  const loginUrl = values.get('--login-url') || env.SF_LOGIN_URL;
  const clientId = values.get('--client-id') || env.SF_CLIENT_ID;
  if (!loginUrl) throw new Error('Provide --login-url or SF_LOGIN_URL.');
  if (!clientId) throw new Error('Provide --client-id or SF_CLIENT_ID.');

  const portText = values.get('--port') || '1717';
  const port = Number(portText);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error('--port must be an integer from 1024 to 65535.');
  }

  const redirectUri = values.get('--redirect-uri');
  if (redirectUri) {
    let isAbsolute = false;
    try {
      new URL(redirectUri);
      isAbsolute = true;
    } catch {
      // Expected for a relative path.
    }
    if (isAbsolute || redirectUri.startsWith('//')) {
      throw new Error('--redirect-uri must be a relative Salesforce path.');
    }
  }

  return {
    help: false,
    loginUrl: normalizeLoginUrl(loginUrl),
    clientId,
    clientSecret: env.SF_CLIENT_SECRET || undefined,
    port,
    redirectUri,
  };
}

function sameState(expected, actual) {
  const left = Buffer.from(expected);
  const right = Buffer.from(actual || '');
  return left.length === right.length && timingSafeEqual(left, right);
}

function sendHtml(response, status, html, nonce) {
  const scriptPolicy = nonce ? `'nonce-${nonce}'` : "'none'";
  const stylePolicy = nonce ? `'nonce-${nonce}'` : "'none'";
  response.writeHead(status, {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store, max-age=0',
    pragma: 'no-cache',
    'referrer-policy': 'no-referrer',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'content-security-policy': `default-src 'none'; script-src ${scriptPolicy}; style-src ${stylePolicy}; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
  });
  response.end(html);
}

async function main() {
  let config;
  try {
    config = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error('\n' + HELP);
    process.exitCode = 1;
    return;
  }
  if (config.help) {
    console.log(HELP);
    return;
  }

  const callbackUrl = `http://localhost:${config.port}/callback`;
  const state = randomBytes(32).toString('base64url');
  const pkce = createPkce();
  const authorizationUrl = createAuthorizationUrl({
    loginUrl: config.loginUrl,
    clientId: config.clientId,
    callbackUrl,
    state,
    codeChallenge: pkce.challenge,
  });

  let handled = false;
  const server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url || '/', callbackUrl);
    if (request.method !== 'GET' || requestUrl.pathname !== '/callback') {
      response.writeHead(404, { 'cache-control': 'no-store' });
      response.end('Not found');
      return;
    }
    if (handled) {
      response.writeHead(409, { 'cache-control': 'no-store' });
      response.end('This OAuth callback has already been handled.');
      return;
    }

    if (!sameState(state, requestUrl.searchParams.get('state'))) {
      sendHtml(
        response,
        400,
        renderErrorPage('OAuth state mismatch. Return to the authorization URL and try again.'),
      );
      return;
    }

    handled = true;
    try {
      const oauthError = requestUrl.searchParams.get('error');
      if (oauthError) {
        const safeError = /^[A-Za-z0-9_.:-]{1,100}$/.test(oauthError)
          ? oauthError
          : 'authorization_error';
        throw new Error(`Salesforce authorization failed: ${safeError}.`);
      }
      const code = requestUrl.searchParams.get('code');
      if (!code) throw new Error('Salesforce callback did not include an authorization code.');

      const token = await exchangeAuthorizationCode({
        loginUrl: config.loginUrl,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        callbackUrl,
        code,
        codeVerifier: pkce.verifier,
      });
      const frontdoorUrl = await generateFrontdoorUrl({
        instanceUrl: token.instanceUrl,
        accessToken: token.accessToken,
        redirectUri: config.redirectUri,
      });
      const page = renderSuccessPage(frontdoorUrl);
      sendHtml(response, 200, page.html, page.nonce);
      console.log('Frontdoor URL generated and displayed in the browser. It was not written to the terminal.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      sendHtml(response, 400, renderErrorPage(message));
      console.error(message);
      process.exitCode = 1;
    } finally {
      server.close();
    }
  });

  server.on('error', (error) => {
    console.error(`Local callback server failed: ${error.message}`);
    process.exitCode = 1;
  });

  server.listen(config.port, 'localhost', () => {
    console.log(`Callback URL: ${callbackUrl}`);
    console.log('Open this authorization URL in your browser:\n');
    console.log(authorizationUrl.href);
    console.log('\nWaiting for Salesforce authentication (up to 5 minutes)…');
  });

  const timeout = setTimeout(() => {
    if (!handled) {
      console.error('Timed out waiting for the OAuth callback. Run the utility again.');
      process.exitCode = 1;
      server.close();
    }
  }, 5 * 60 * 1000);
  timeout.unref();
  server.on('close', () => clearTimeout(timeout));
}

await main();

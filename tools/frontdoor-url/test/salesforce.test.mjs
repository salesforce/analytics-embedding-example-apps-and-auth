import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createAuthorizationUrl,
  createPkce,
  exchangeAuthorizationCode,
  generateFrontdoorUrl,
  normalizeLoginUrl,
} from '../src/salesforce.mjs';
import { renderErrorPage, renderSuccessPage } from '../src/page.mjs';

test('normalizes an HTTPS login URL without Salesforce hostname guessing', () => {
  assert.equal(
    normalizeLoginUrl('https://example.my.salesforce.com/'),
    'https://example.my.salesforce.com',
  );
  assert.throws(() => normalizeLoginUrl('http://example.com'), /HTTPS/);
  assert.throws(() => normalizeLoginUrl('not a URL'), /complete HTTPS URL/);
  assert.throws(
    () => normalizeLoginUrl('https://example.com/?token=secret'),
    /query/,
  );
});

test('creates a valid PKCE verifier and S256 challenge', () => {
  const pkce = createPkce();
  assert.match(pkce.verifier, /^[A-Za-z0-9_-]{43,128}$/);
  assert.match(pkce.challenge, /^[A-Za-z0-9_-]{43}$/);
});

test('builds the Salesforce authorization request', () => {
  const url = createAuthorizationUrl({
    loginUrl: 'https://example.my.salesforce.com',
    clientId: 'consumer-key',
    callbackUrl: 'http://localhost:1717/callback',
    state: 'csrf-state',
    codeChallenge: 'pkce-challenge',
  });
  assert.equal(url.pathname, '/services/oauth2/authorize');
  assert.equal(url.searchParams.get('response_type'), 'code');
  assert.equal(url.searchParams.get('scope'), 'web');
  assert.equal(url.searchParams.get('state'), 'csrf-state');
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
});

test('exchanges an authorization code without logging credentials', async () => {
  let captured;
  const fetchMock = async (url, init) => {
    captured = { url: String(url), init };
    return new Response(
      JSON.stringify({
        access_token: 'access-token',
        instance_url: 'https://example.my.salesforce.com',
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };
  const result = await exchangeAuthorizationCode(
    {
      loginUrl: 'https://example.my.salesforce.com',
      clientId: 'consumer-key',
      clientSecret: 'consumer-secret',
      callbackUrl: 'http://localhost:1717/callback',
      code: 'authorization-code',
      codeVerifier: 'verifier',
    },
    fetchMock,
  );
  assert.deepEqual(result, {
    accessToken: 'access-token',
    instanceUrl: 'https://example.my.salesforce.com',
  });
  assert.match(captured.url, /\/services\/oauth2\/token$/);
  assert.equal(captured.init.method, 'POST');
  assert.equal(captured.init.body.get('client_secret'), 'consumer-secret');
  assert.equal(captured.init.body.get('code_verifier'), 'verifier');
});

test('sends the access token in a header to UI Bridge', async () => {
  let captured;
  const fetchMock = async (url, init) => {
    captured = { url: String(url), init };
    return new Response(
      JSON.stringify({
        frontdoor_uri:
          'https://example.my.salesforce.com/secur/frontdoor.jsp?otp=one-time',
      }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
  };
  const frontdoorUrl = await generateFrontdoorUrl(
    {
      instanceUrl: 'https://example.my.salesforce.com',
      accessToken: 'access-token',
      redirectUri: 'lightning/page/home',
    },
    fetchMock,
  );
  assert.match(captured.url, /\/services\/oauth2\/singleaccess$/);
  assert.equal(captured.init.headers.authorization, 'Bearer access-token');
  assert.equal(captured.init.body.get('redirect_uri'), 'lightning/page/home');
  assert.match(frontdoorUrl, /frontdoor\.jsp\?otp=one-time$/);
});

test('rejects missing, malformed, and non-HTTPS frontdoor URLs', async () => {
  const responseFor = (payload) => async () =>
    new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  const config = {
    instanceUrl: 'https://example.my.salesforce.com',
    accessToken: 'access-token',
  };

  await assert.rejects(
    generateFrontdoorUrl(config, responseFor({})),
    /omitted frontdoor_uri/,
  );
  await assert.rejects(
    generateFrontdoorUrl(config, responseFor({ frontdoor_uri: 'not a URL' })),
    /invalid frontdoor_uri/,
  );
  await assert.rejects(
    generateFrontdoorUrl(
      config,
      responseFor({ frontdoor_uri: 'http://example.com/secur/frontdoor.jsp' }),
    ),
    /non-HTTPS frontdoor_uri/,
  );
});

test('surfaces Salesforce error codes without echoing response bodies', async () => {
  const fetchMock = async () =>
    new Response(JSON.stringify({ error: 'invalid_grant' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  await assert.rejects(
    exchangeAuthorizationCode(
      {
        loginUrl: 'https://example.my.salesforce.com',
        clientId: 'consumer-key',
        callbackUrl: 'http://localhost:1717/callback',
        code: 'bad-code',
        codeVerifier: 'verifier',
      },
      fetchMock,
    ),
    /invalid_grant/,
  );
});

test('renders a no-dependency result page with escaped credential text', () => {
  const result = renderSuccessPage(
    'https://example.my.salesforce.com/secur/frontdoor.jsp?otp=a&startURL=b',
  );
  assert.match(result.html, /otp=a&amp;startURL=b/);
  assert.ok(result.nonce.length > 20);
  assert.doesNotMatch(renderErrorPage('<script>alert(1)</script>'), /<script>alert/);
});

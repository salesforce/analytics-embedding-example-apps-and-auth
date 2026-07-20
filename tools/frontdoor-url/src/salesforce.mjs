import { createHash, randomBytes } from 'node:crypto';

/**
 * This is intentionally syntax validation, not a Salesforce-host allowlist.
 * My Domain and Experience Cloud hostname shapes evolve over time.
 */
export function normalizeLoginUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('The login URL must be a complete HTTPS URL.');
  }
  if (url.protocol !== 'https:') {
    throw new Error('The login URL must use HTTPS.');
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('The login URL cannot contain credentials, a query, or a fragment.');
  }
  return url.origin;
}

export function createPkce() {
  const verifier = randomBytes(48).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

export function createAuthorizationUrl({
  loginUrl,
  clientId,
  callbackUrl,
  state,
  codeChallenge,
}) {
  const url = new URL('/services/oauth2/authorize', normalizeLoginUrl(loginUrl));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', callbackUrl);
  url.searchParams.set('scope', 'web');
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url;
}

async function readError(response) {
  const text = await response.text();
  try {
    const payload = JSON.parse(text);
    const code = payload.error || payload.errorCode;
    return typeof code === 'string' && /^[A-Za-z0-9_.:-]{1,100}$/.test(code)
      ? code
      : '';
  } catch {
    const trimmed = text.trim();
    return /^[A-Za-z0-9_.:-]{1,100}$/.test(trimmed) ? trimmed : '';
  }
}

export async function exchangeAuthorizationCode(
  {
    loginUrl,
    clientId,
    clientSecret,
    callbackUrl,
    code,
    codeVerifier,
  },
  fetchImpl = fetch,
) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    redirect_uri: callbackUrl,
    code_verifier: codeVerifier,
  });
  if (clientSecret) body.set('client_secret', clientSecret);

  const response = await fetchImpl(
    new URL('/services/oauth2/token', normalizeLoginUrl(loginUrl)),
    {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!response.ok) {
    const detail = await readError(response);
    throw new Error(
      `Salesforce token exchange failed (${response.status})${detail ? `: ${detail}` : ''}`,
    );
  }

  const payload = await response.json();
  if (!payload.access_token || !payload.instance_url) {
    throw new Error('Salesforce token response omitted access_token or instance_url.');
  }
  return {
    accessToken: payload.access_token,
    instanceUrl: normalizeLoginUrl(payload.instance_url),
  };
}

export async function generateFrontdoorUrl(
  { instanceUrl, accessToken, redirectUri },
  fetchImpl = fetch,
) {
  const body = new URLSearchParams();
  if (redirectUri) body.set('redirect_uri', redirectUri);

  const response = await fetchImpl(
    new URL('/services/oauth2/singleaccess', normalizeLoginUrl(instanceUrl)),
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!response.ok) {
    const detail = await readError(response);
    throw new Error(
      `UI Bridge request failed (${response.status})${detail ? `: ${detail}` : ''}`,
    );
  }

  const payload = await response.json();
  if (typeof payload.frontdoor_uri !== 'string') {
    throw new Error('UI Bridge response omitted frontdoor_uri.');
  }
  let frontdoorUrl;
  try {
    frontdoorUrl = new URL(payload.frontdoor_uri);
  } catch {
    throw new Error('UI Bridge returned an invalid frontdoor_uri.');
  }
  if (frontdoorUrl.protocol !== 'https:') {
    throw new Error('UI Bridge returned a non-HTTPS frontdoor_uri.');
  }
  return frontdoorUrl.href;
}

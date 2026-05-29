/**
 * Singleton init guard for `initializeAnalyticsSdk`. The SDK is loaded from
 * a CDN by `<script type="module">` — see init-page.js for the URL.
 */
import { log } from './log.js';

/**
 * The SDK's full module shape — comes from the real types so we get
 * accurate enum values at typecheck time.
 *
 * @typedef {typeof import('@salesforce/analytics-embedding-sdk')} SdkModule
 * @typedef {import('@salesforce/analytics-embedding-sdk').BootstrapResponse} BootstrapResponse
 */

/** @type {Promise<BootstrapResponse> | null} */
let inflight = null;
/** @type {BootstrapResponse | null} */
let resolved = null;

/**
 * @param {{ orgUrl: string, authCredential: string }} config
 * @param {SdkModule} sdk
 * @returns {Promise<BootstrapResponse>}
 */
export function initSdkOnce(config, sdk) {
  if (resolved) return Promise.resolve(resolved);
  if (inflight) return inflight;

  log.info('initializeAnalyticsSdk: starting', { orgUrl: config.orgUrl });
  inflight = sdk
    .initializeAnalyticsSdk({
      orgUrl: config.orgUrl,
      authCredential: config.authCredential,
    })
    .then(
      /** @param {BootstrapResponse} response */
      (response) => {
        resolved = response;
        log.info('initializeAnalyticsSdk: resolved', { status: response.status });
        return response;
      },
    )
    .catch(
      /** @param {unknown} err */
      (err) => {
        log.error('initializeAnalyticsSdk: threw', { err });
        const message =
          err instanceof Error
            ? err.message
            : typeof err === 'string'
              ? err
              : 'Unknown error';
        /** @type {BootstrapResponse} */
        const fallback = { status: sdk.Status.FAILURE, message };
        resolved = fallback;
        return fallback;
      },
    );

  return inflight;
}

/**
 * Inspect the multi-org states map for an org needing AUTH_REDIRECT
 * (MFA / password reset). Returns the redirect target if found.
 *
 * @param {SdkModule} sdk
 * @param {BootstrapResponse} response
 * @returns {{ orgUrl: string, continueUrl?: string } | null}
 */
export function findAuthRedirect(sdk, response) {
  if (!response.orgStates) return null;
  for (const [orgUrl, info] of response.orgStates) {
    if (info.state === sdk.OrgStates.AUTH_REDIRECT) {
      const continueUrl =
        info.redirectOrigin && info.redirectUrl
          ? `${info.redirectOrigin}${info.redirectUrl}`
          : undefined;
      return { orgUrl, continueUrl };
    }
  }
  return null;
}

import {
  initializeAnalyticsSdk,
  Status,
  OrgStates,
  retryOrAddOrgs,
  type BootstrapResponse,
} from '@salesforce/analytics-embedding-sdk';
import type { DemoConfig } from './config';
import { log } from './log';

/**
 * Singleton init guard. The SDK should be initialized **once** per page
 * load. Re-init only happens after a Reset (which navigates to the
 * config form and triggers a full reload via location.assign).
 */
let inflight: Promise<BootstrapResponse> | null = null;
let resolved: BootstrapResponse | null = null;

export function initSdkOnce(config: DemoConfig): Promise<BootstrapResponse> {
  if (resolved) return Promise.resolve(resolved);
  if (inflight) return inflight;

  log.info('initializeAnalyticsSdk: starting', { orgUrl: config.orgUrl });
  inflight = initializeAnalyticsSdk({
    orgUrl: config.orgUrl,
    authCredential: config.authCredential,
  })
    .then((response) => {
      resolved = response;
      log.info('initializeAnalyticsSdk: resolved', { status: response.status });
      return response;
    })
    .catch((err: unknown): BootstrapResponse => {
      // The SDK should always resolve with a Status, but defensively wrap
      // network/runtime failures into the same shape so callers have one
      // code path.
      log.error('initializeAnalyticsSdk: threw', { err });
      const message = err instanceof Error ? err.message : String(err);
      const fallback: BootstrapResponse = {
        status: Status.FAILURE,
        message,
      };
      resolved = fallback;
      return fallback;
    });

  return inflight;
}

/**
 * Inspect the multi-org states map to detect if any org is in
 * AUTH_REDIRECT (MFA / password reset). Returns the redirect target
 * URL if found.
 */
export function getAuthRedirect(
  response: BootstrapResponse,
): { continueUrl?: string; orgUrl: string } | null {
  if (!response.orgStates) return null;
  for (const [orgUrl, info] of response.orgStates) {
    if (info.state === OrgStates.AUTH_REDIRECT) {
      const continueUrl =
        info.redirectOrigin && info.redirectUrl
          ? `${info.redirectOrigin}${info.redirectUrl}`
          : undefined;
      return { continueUrl, orgUrl };
    }
  }
  return null;
}

/**
 * Re-issues init for the org that needs reauthentication. After MFA,
 * the spec-supported pattern is `authCredential: orgUrl` to resume the
 * existing session without regenerating a frontdoor URL.
 */
export function retryAuth(orgUrl: string): Promise<BootstrapResponse> {
  return retryOrAddOrgs([{ orgUrl, authCredential: orgUrl }]);
}

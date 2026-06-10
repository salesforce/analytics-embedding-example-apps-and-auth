/**
 * localStorage-backed config for the in-app config form.
 * Keys are namespaced to avoid colliding with consumer apps that fork this
 * example. Identical keys across all example apps in this repo so users can
 * test-drive different stacks against the same browser without re-pasting.
 */

export const STORAGE_KEYS = {
  orgUrl: 'analytics-sdk-demo:orgUrl',
  authCredential: 'analytics-sdk-demo:authCredential',
} as const;

export interface DemoConfig {
  orgUrl: string;
  authCredential: string;
}

export type ValidationError = 'INVALID_ORG_URL' | 'EMPTY_AUTH_CREDENTIAL';

// Salesforce serves Lightning from many host shapes (production, sandboxes,
// scratch orgs, enhanced domains, pre-release instances like `*.pc-rnd.force.com`).
// Enumerating them all is a losing game, so we only check that the org URL is a
// well-formed https URL and let the SDK reject a wrong host at init time.
function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateConfig(input: {
  orgUrl: string;
  authCredential: string;
}): ValidationError | null {
  if (!isHttpsUrl(input.orgUrl.trim())) return 'INVALID_ORG_URL';
  if (input.authCredential.trim().length === 0) return 'EMPTY_AUTH_CREDENTIAL';
  return null;
}

/**
 * Returns a usable config or `null` if either key is missing/blank.
 * Never throws — `localStorage` access can fail in private mode and we want
 * the caller to render the Setup form cleanly in that case.
 */
export function loadConfig(): DemoConfig | null {
  try {
    const orgUrl = localStorage.getItem(STORAGE_KEYS.orgUrl);
    const authCredential = localStorage.getItem(STORAGE_KEYS.authCredential);
    if (!orgUrl || !authCredential) return null;
    return { orgUrl, authCredential };
  } catch {
    return null;
  }
}

export function saveConfig(config: DemoConfig): void {
  localStorage.setItem(STORAGE_KEYS.orgUrl, config.orgUrl.trim());
  localStorage.setItem(STORAGE_KEYS.authCredential, config.authCredential.trim());
}

export function clearConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.orgUrl);
    localStorage.removeItem(STORAGE_KEYS.authCredential);
  } catch {
    // Already gone or storage unavailable — nothing to do.
  }
}

/**
 * Probes localStorage by writing+removing a sentinel. Used to detect private
 * browsing / disabled storage so we can warn the user that settings won't
 * persist.
 */
export function isStorageAvailable(): boolean {
  const sentinel = '__analytics-sdk-demo-probe__';
  try {
    localStorage.setItem(sentinel, '1');
    localStorage.removeItem(sentinel);
    return true;
  } catch {
    return false;
  }
}

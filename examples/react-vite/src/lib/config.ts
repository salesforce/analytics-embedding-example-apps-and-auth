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

const LIGHTNING_URL_RE = /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.lightning\.force\.com\/?$/i;

export type ValidationError = 'INVALID_ORG_URL' | 'EMPTY_AUTH_CREDENTIAL';

export function validateConfig(input: {
  orgUrl: string;
  authCredential: string;
}): ValidationError | null {
  const trimmedUrl = input.orgUrl.trim();
  if (!LIGHTNING_URL_RE.test(trimmedUrl)) return 'INVALID_ORG_URL';
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

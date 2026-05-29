/**
 * Browser localStorage helpers. Same keys, same validation as the React +
 * Angular examples — fork any example without re-pasting credentials.
 */

export const STORAGE_KEYS = Object.freeze({
  orgUrl: 'analytics-sdk-demo:orgUrl',
  authCredential: 'analytics-sdk-demo:authCredential',
});

const LIGHTNING_URL_RE =
  /^https:\/\/[a-z0-9-]+(?:\.[a-z0-9-]+)*\.lightning\.force\.com\/?$/i;

/**
 * @typedef {{ orgUrl: string, authCredential: string }} DemoConfig
 * @typedef {'INVALID_ORG_URL' | 'EMPTY_AUTH_CREDENTIAL'} ValidationError
 */

/**
 * @param {{ orgUrl: string, authCredential: string }} input
 * @returns {ValidationError | null}
 */
export function validateConfig(input) {
  if (!LIGHTNING_URL_RE.test(input.orgUrl.trim())) return 'INVALID_ORG_URL';
  if (input.authCredential.trim().length === 0) return 'EMPTY_AUTH_CREDENTIAL';
  return null;
}

/** @returns {DemoConfig | null} */
export function loadConfig() {
  try {
    const orgUrl = localStorage.getItem(STORAGE_KEYS.orgUrl);
    const authCredential = localStorage.getItem(STORAGE_KEYS.authCredential);
    if (!orgUrl || !authCredential) return null;
    return { orgUrl, authCredential };
  } catch {
    return null;
  }
}

/** @param {DemoConfig} config */
export function saveConfig(config) {
  localStorage.setItem(STORAGE_KEYS.orgUrl, config.orgUrl.trim());
  localStorage.setItem(STORAGE_KEYS.authCredential, config.authCredential.trim());
}

export function clearConfig() {
  try {
    localStorage.removeItem(STORAGE_KEYS.orgUrl);
    localStorage.removeItem(STORAGE_KEYS.authCredential);
  } catch {
    /* nothing to do */
  }
}

/** @returns {boolean} */
export function isStorageAvailable() {
  const sentinel = '__analytics-sdk-demo-probe__';
  try {
    localStorage.setItem(sentinel, '1');
    localStorage.removeItem(sentinel);
    return true;
  } catch {
    return false;
  }
}

/**
 * Pages other than `index.html` should redirect to setup if config is
 * missing. Call at top of agent.html / showcase.html scripts.
 */
export function redirectIfUnconfigured() {
  if (!loadConfig()) {
    location.replace('./index.html');
  }
}

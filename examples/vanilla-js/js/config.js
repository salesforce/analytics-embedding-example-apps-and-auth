/**
 * Browser localStorage helpers. Same keys, same validation as the React +
 * Angular examples — fork any example without re-pasting credentials.
 */

export const STORAGE_KEYS = Object.freeze({
  orgUrl: 'analytics-sdk-demo:orgUrl',
  authCredential: 'analytics-sdk-demo:authCredential',
});

/**
 * @typedef {{ orgUrl: string, authCredential: string }} DemoConfig
 * @typedef {'INVALID_ORG_URL' | 'EMPTY_AUTH_CREDENTIAL'} ValidationError
 */

/**
 * Salesforce serves Lightning from many host shapes (production, sandboxes,
 * scratch orgs, enhanced domains, pre-release instances like
 * `*.pc-rnd.force.com`). Enumerating them all is a losing game, so we only
 * check that the org URL is a well-formed https URL and let the SDK reject a
 * wrong host at init time.
 * @param {string} value
 * @returns {boolean}
 */
function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * @param {{ orgUrl: string, authCredential: string }} input
 * @returns {ValidationError | null}
 */
export function validateConfig(input) {
  if (!isHttpsUrl(input.orgUrl.trim())) return 'INVALID_ORG_URL';
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

/**
 * @typedef {{ orgUrl: string, authCredential: string }} DemoConfig
 * @typedef {'INVALID_ORG_URL' | 'EMPTY_AUTH_CREDENTIAL'} ValidationError
 */

/**
 * Check URL syntax and HTTPS only. Salesforce supports many valid org host
 * shapes, so the SDK remains the source of truth for whether an org can init.
 * @param {string} value
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

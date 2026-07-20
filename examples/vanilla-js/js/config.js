/**
 * @typedef {{ dashboard: string, metric: string, visualization: string, agent: string }} AssetConfig
 * @typedef {{ orgUrl: string, authCredential: string, assets: AssetConfig }} DemoConfig
 * @typedef {'INVALID_ORG_URL' | 'EMPTY_AUTH_CREDENTIAL' | 'EMPTY_ASSET_CONFIG'} ValidationError
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
 * @param {DemoConfig} input
 * @returns {ValidationError | null}
 */
export function validateConfig(input) {
  if (!isHttpsUrl(input.orgUrl.trim())) return 'INVALID_ORG_URL';
  if (input.authCredential.trim().length === 0) return 'EMPTY_AUTH_CREDENTIAL';
  if (!Object.values(input.assets).some((value) => value.trim().length > 0)) {
    return 'EMPTY_ASSET_CONFIG';
  }
  return null;
}

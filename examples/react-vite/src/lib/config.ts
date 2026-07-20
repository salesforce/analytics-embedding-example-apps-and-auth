export interface AssetConfig {
  dashboard: string;
  metric: string;
  visualization: string;
  agent: string;
}

export const EMPTY_ASSETS: AssetConfig = {
  dashboard: '',
  metric: '',
  visualization: '',
  agent: '',
};

export interface DemoConfig {
  orgUrl: string;
  authCredential: string;
  assets: AssetConfig;
}

export type ValidationError =
  | 'INVALID_ORG_URL'
  | 'EMPTY_AUTH_CREDENTIAL'
  | 'EMPTY_ASSET_CONFIG';

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
  assets: AssetConfig;
}): ValidationError | null {
  if (!isHttpsUrl(input.orgUrl.trim())) return 'INVALID_ORG_URL';
  if (input.authCredential.trim().length === 0) return 'EMPTY_AUTH_CREDENTIAL';
  if (!Object.values(input.assets).some((value) => value.trim().length > 0)) {
    return 'EMPTY_ASSET_CONFIG';
  }
  return null;
}

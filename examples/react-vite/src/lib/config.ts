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

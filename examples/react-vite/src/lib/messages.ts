/**
 * Canonical error message keys + copy. Kept identical (in spirit) across
 * every example app in this repo so users see the same words regardless of
 * stack. If you fork one example, port the same keys to the others.
 */
export const messages = {
  INVALID_ORG_URL:
    'Enter your org URL as a full https URL, e.g. https://yourorg.lightning.force.com.',
  AUTH_REDIRECT:
    'Salesforce needs additional verification (MFA or password reset). Continue in a new tab, then return and click Retry.',
  INIT_FAILED: (sdkMessage: string): string =>
    `Couldn't initialize the SDK. ${sdkMessage}`,
  RENDER_FAILED: (idOrApiName: string): string =>
    `Couldn't load "${idOrApiName}". Check that the asset exists in your org and that you have permission.`,
} as const;

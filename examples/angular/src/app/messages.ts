/**
 * Canonical error message keys + copy. Identical (in spirit) across every
 * example app in this repo.
 */
export const messages = {
  INVALID_ORG_URL:
    'Use the Lightning URL (e.g. https://yourorg.lightning.force.com), not the my.salesforce.com domain.',
  AUTH_REDIRECT:
    'Salesforce needs additional verification (MFA or password reset). Continue in a new tab, then return and click Retry.',
  INIT_FAILED: (sdkMessage: string): string =>
    `Couldn't initialize the SDK. ${sdkMessage}`,
  RENDER_FAILED: (idOrApiName: string): string =>
    `Couldn't load "${idOrApiName}". Check that the asset exists in your org and that you have permission.`,
  STORAGE_UNAVAILABLE:
    "Settings won't persist in this browser. Private browsing or storage restrictions are likely the cause.",
} as const;

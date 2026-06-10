/**
 * Canonical error message keys + copy. Identical (in spirit) across every
 * example app in this repo so users see the same words regardless of stack.
 */
export const messages = Object.freeze({
  INVALID_ORG_URL:
    'Enter your org URL as a full https URL, e.g. https://yourorg.lightning.force.com.',
  AUTH_REDIRECT:
    'Salesforce needs additional verification (MFA or password reset). Continue in a new tab, then return and click Retry.',
  /** @param {string} sdkMessage */
  INIT_FAILED: (sdkMessage) => `Couldn't initialize the SDK. ${sdkMessage}`,
  /** @param {string} idOrApiName */
  RENDER_FAILED: (idOrApiName) =>
    `Couldn't load "${idOrApiName}". Check that the asset exists in your org and that you have permission.`,
  STORAGE_UNAVAILABLE:
    "Settings won't persist in this browser. Private browsing or storage restrictions are likely the cause.",
});

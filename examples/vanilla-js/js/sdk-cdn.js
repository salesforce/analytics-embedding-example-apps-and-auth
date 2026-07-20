/**
 * Single source of truth for the SDK CDN URL. Pinning an exact version keeps
 * this reference example reproducible. Update it with package.json.
 */
export const SDK_CDN_URL =
  'https://cdn.jsdelivr.net/npm/@salesforce/analytics-embedding-sdk@2.0.0/dist/sdk-bundle.module.js';

/**
 * Lazily import the SDK module while keeping remote loading in one place.
 * @returns {Promise<any>}
 */
export function loadSdk() {
  return import(/* @vite-ignore */ SDK_CDN_URL);
}

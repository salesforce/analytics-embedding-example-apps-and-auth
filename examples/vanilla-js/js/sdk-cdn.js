/**
 * Single source of truth for the SDK CDN URL. Pinned to major version 1 to
 * stay forward-compatible with patch + minor releases. Override by editing
 * this constant if your environment proxies to a private mirror.
 */
export const SDK_CDN_URL =
  'https://cdn.jsdelivr.net/npm/@salesforce/analytics-embedding-sdk@1/dist/sdk-bundle.module.js';

/**
 * Lazily import the SDK module. Wrapped so tests can mock the import path.
 * @returns {Promise<any>}
 */
export function loadSdk() {
  return import(/* @vite-ignore */ SDK_CDN_URL);
}

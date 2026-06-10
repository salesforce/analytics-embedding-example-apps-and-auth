import { describe, it, expect, beforeEach } from 'vitest';
import {
  STORAGE_KEYS,
  loadConfig,
  saveConfig,
  clearConfig,
  validateConfig,
  isStorageAvailable,
} from '../js/config.js';

describe('config helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loadConfig returns null when localStorage is empty', () => {
    expect(loadConfig()).toBeNull();
  });

  it('saveConfig persists both keys', () => {
    saveConfig({
      orgUrl: 'https://acme.lightning.force.com',
      authCredential: 'frontdoor',
    });
    expect(localStorage.getItem(STORAGE_KEYS.orgUrl)).toBe(
      'https://acme.lightning.force.com',
    );
    expect(localStorage.getItem(STORAGE_KEYS.authCredential)).toBe('frontdoor');
  });

  it('loadConfig returns saved config when populated', () => {
    saveConfig({
      orgUrl: 'https://acme.lightning.force.com',
      authCredential: 'frontdoor',
    });
    expect(loadConfig()).toEqual({
      orgUrl: 'https://acme.lightning.force.com',
      authCredential: 'frontdoor',
    });
  });

  it('clearConfig removes both keys', () => {
    saveConfig({
      orgUrl: 'https://acme.lightning.force.com',
      authCredential: 'frontdoor',
    });
    clearConfig();
    expect(loadConfig()).toBeNull();
  });

  it('validateConfig accepts an https org URL and rejects malformed input', () => {
    expect(
      validateConfig({
        orgUrl: 'https://acme.lightning.force.com',
        authCredential: 'frontdoor',
      }),
    ).toBeNull();
    expect(
      validateConfig({
        orgUrl: 'not-a-url',
        authCredential: 'frontdoor',
      }),
    ).toBe('INVALID_ORG_URL');
    expect(
      validateConfig({
        orgUrl: 'https://acme.lightning.force.com',
        authCredential: '   ',
      }),
    ).toBe('EMPTY_AUTH_CREDENTIAL');
  });

  it('isStorageAvailable returns true in jsdom', () => {
    expect(isStorageAvailable()).toBe(true);
  });
});

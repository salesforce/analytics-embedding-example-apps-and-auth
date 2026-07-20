import { describe, it, expect, vi } from 'vitest';
import { validateConfig } from '../js/config.js';
import { findAuthRedirect } from '../js/init.js';
import { renderErrorPanel } from '../js/error-panel.js';

describe('config validation', () => {
  it('accepts an HTTPS org URL', () => {
    expect(
      validateConfig({
        orgUrl: 'https://acme.lightning.force.com',
        authCredential: 'frontdoor',
        assets: { dashboard: 'dashboard', metric: 'metric', visualization: 'viz', agent: 'agent' },
      }),
    ).toBeNull();
  });

  it('rejects a malformed org URL', () => {
    expect(
      validateConfig({
        orgUrl: 'not-a-url',
        authCredential: 'frontdoor',
        assets: { dashboard: 'dashboard', metric: 'metric', visualization: 'viz', agent: 'agent' },
      }),
    ).toBe('INVALID_ORG_URL');
  });

  it('rejects an empty credential', () => {
    expect(
      validateConfig({
        orgUrl: 'https://acme.lightning.force.com',
        authCredential: '   ',
        assets: { dashboard: 'dashboard', metric: 'metric', visualization: 'viz', agent: 'agent' },
      }),
    ).toBe('EMPTY_AUTH_CREDENTIAL');
  });

  it('accepts one asset and rejects an empty asset config', () => {
    expect(
      validateConfig({
        orgUrl: 'https://acme.lightning.force.com',
        authCredential: 'frontdoor',
        assets: { dashboard: 'dashboard', metric: 'metric', visualization: 'viz', agent: '' },
      }),
    ).toBeNull();
    expect(
      validateConfig({
        orgUrl: 'https://acme.lightning.force.com',
        authCredential: 'frontdoor',
        assets: { dashboard: '', metric: '', visualization: '', agent: '' },
      }),
    ).toBe('EMPTY_ASSET_CONFIG');
  });
});

describe('authentication recovery', () => {
  it('finds the org and URL that require additional verification', () => {
    const sdk = /** @type {any} */ ({
      OrgStates: { AUTH_REDIRECT: 'AUTH_REDIRECT' },
    });
    const response = /** @type {any} */ ({
      orgStates: new Map([
        [
          'https://acme.lightning.force.com',
          {
            state: 'AUTH_REDIRECT',
            redirectOrigin: 'https://login.salesforce.com',
            redirectUrl: '/verify',
          },
        ],
      ]),
    });
    expect(findAuthRedirect(sdk, response)).toEqual({
      orgUrl: 'https://acme.lightning.force.com',
      continueUrl: 'https://login.salesforce.com/verify',
    });
  });

  it('wires the Retry action in the recovery panel', () => {
    const host = document.createElement('div');
    const onRetry = vi.fn();
    renderErrorPanel(host, {
      title: 'Additional verification needed',
      detail: 'Continue verification, then retry.',
      onRetry,
    });
    host.querySelector('button')?.click();
    expect(onRetry).toHaveBeenCalledOnce();
    expect(host.textContent).toContain('Additional verification needed');
  });
});

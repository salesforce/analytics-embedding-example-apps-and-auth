import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigGate } from '../src/ConfigGate';
import {
  STORAGE_KEYS,
  loadConfig,
  saveConfig,
  clearConfig,
  validateConfig,
} from '../src/lib/config';

describe('ConfigGate', () => {
  it('renders the form when localStorage is empty', () => {
    render(<ConfigGate onConfig={() => {}} />);
    expect(
      screen.getByRole('textbox', { name: /org url/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /frontdoor url/i }),
    ).toBeInTheDocument();
  });

  it('persists both keys to localStorage on save', async () => {
    const user = userEvent.setup();
    render(<ConfigGate onConfig={() => {}} />);
    await user.type(
      screen.getByRole('textbox', { name: /org url/i }),
      'https://acme.lightning.force.com',
    );
    await user.type(
      screen.getByRole('textbox', { name: /frontdoor url/i }),
      'https://acme.lightning.force.com/secur/frontdoor.jsp?sid=ABC',
    );
    await user.click(screen.getByRole('button', { name: /save and connect/i }));

    expect(localStorage.getItem(STORAGE_KEYS.orgUrl)).toBe(
      'https://acme.lightning.force.com',
    );
    expect(localStorage.getItem(STORAGE_KEYS.authCredential)).toBe(
      'https://acme.lightning.force.com/secur/frontdoor.jsp?sid=ABC',
    );
  });

  it('rejects non-Lightning org URLs', async () => {
    const user = userEvent.setup();
    let captured: unknown = null;
    render(<ConfigGate onConfig={(c) => (captured = c)} />);
    await user.type(
      screen.getByRole('textbox', { name: /org url/i }),
      'https://acme.my.salesforce.com',
    );
    await user.type(
      screen.getByRole('textbox', { name: /frontdoor url/i }),
      'frontdoor',
    );
    await user.click(screen.getByRole('button', { name: /save and connect/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/lightning/i);
    expect(captured).toBeNull();
  });
});

describe('config helpers', () => {
  it('loadConfig returns null when keys are missing', () => {
    expect(loadConfig()).toBeNull();
  });

  it('loadConfig returns saved config when both keys are populated', () => {
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

  it('validateConfig accepts a Lightning URL and rejects my.salesforce.com', () => {
    expect(
      validateConfig({
        orgUrl: 'https://acme.lightning.force.com',
        authCredential: 'frontdoor',
      }),
    ).toBeNull();
    expect(
      validateConfig({
        orgUrl: 'https://acme.my.salesforce.com',
        authCredential: 'frontdoor',
      }),
    ).toBe('INVALID_ORG_URL');
    expect(
      validateConfig({
        orgUrl: 'https://acme.lightning.force.com',
        authCredential: '',
      }),
    ).toBe('EMPTY_AUTH_CREDENTIAL');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Setup } from '../src/Setup';
import { validateConfig } from '../src/lib/config';

describe('Setup', () => {
  it('renders the setup form', () => {
    render(<Setup onConfig={() => {}} />);
    expect(
      screen.getByRole('textbox', { name: /org url/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /frontdoor url/i }),
    ).toBeInTheDocument();
  });

  it('passes a trimmed, in-memory config to the app', async () => {
    const user = userEvent.setup();
    const onConfig = vi.fn();
    render(<Setup onConfig={onConfig} />);
    await user.type(
      screen.getByRole('textbox', { name: /org url/i }),
      '  https://acme.lightning.force.com  ',
    );
    await user.type(
      screen.getByRole('textbox', { name: /frontdoor url/i }),
      'https://acme.lightning.force.com/secur/frontdoor.jsp?token=one-time',
    );
    await user.click(screen.getByRole('button', { name: /^connect$/i }));

    expect(onConfig).toHaveBeenCalledWith({
      orgUrl: 'https://acme.lightning.force.com',
      authCredential:
        'https://acme.lightning.force.com/secur/frontdoor.jsp?token=one-time',
    });
    expect(localStorage.length).toBe(0);
  });

  it('rejects a malformed org URL', async () => {
    const user = userEvent.setup();
    let captured: unknown = null;
    render(<Setup onConfig={(c) => (captured = c)} />);
    await user.type(
      screen.getByRole('textbox', { name: /org url/i }),
      'not-a-url',
    );
    await user.type(
      screen.getByRole('textbox', { name: /frontdoor url/i }),
      'frontdoor',
    );
    await user.click(screen.getByRole('button', { name: /^connect$/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(captured).toBeNull();
  });
});

describe('config helpers', () => {
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
        authCredential: '',
      }),
    ).toBe('EMPTY_AUTH_CREDENTIAL');
  });
});

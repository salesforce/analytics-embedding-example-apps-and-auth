/**
 * Injects the shared header (brand, nav, Reset config button) into a host
 * element. Same affordances as the React + Angular AppHeader. Returns a
 * controller so the page script can disable Reset during init.
 */
import { clearConfig } from './config.js';

/**
 * @typedef {Object} NavController
 * @property {(disabled: boolean) => void} setResetDisabled
 */

/**
 * @param {HTMLElement} host
 * @param {{ active: 'showcase' | 'agent' }} opts
 * @returns {NavController}
 */
export function renderNav(host, opts) {
  host.replaceChildren();
  const header = document.createElement('header');
  header.className = 'app-header';

  const brand = document.createElement('div');
  brand.className = 'app-header__brand';
  const strong = document.createElement('strong');
  strong.textContent = 'Analytics Embedding SDK';
  const tag = document.createElement('span');
  tag.className = 'app-header__tag';
  tag.textContent = 'Vanilla JS example';
  brand.append(strong, tag);

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Primary');
  /** @type {[string, string, 'showcase'|'agent'][]} */
  const links = [
    ['./showcase.html', 'Showcase', 'showcase'],
    ['./agent.html', 'Agent', 'agent'],
  ];
  for (const [href, text, key] of links) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    if (opts.active === key) a.setAttribute('aria-current', 'page');
    nav.append(a);
  }

  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'btn btn--ghost';
  reset.textContent = 'Reset config';
  reset.addEventListener('click', () => {
    if (reset.disabled) return;
    clearConfig();
    location.assign('./index.html');
  });

  header.append(brand, nav, reset);
  host.append(header);

  return {
    setResetDisabled(disabled) {
      reset.disabled = disabled;
      reset.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    },
  };
}

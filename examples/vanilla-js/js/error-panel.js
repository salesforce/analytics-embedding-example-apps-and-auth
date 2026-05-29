/**
 * Renders the canonical error panel (same shape as React + Angular). Pure
 * DOM manipulation — pass it a host element and an options object.
 */

/**
 * @typedef {Object} ErrorPanelOptions
 * @property {string} title
 * @property {string} detail
 * @property {() => void} [onReset]
 * @property {() => void} [onRetry]
 * @property {string} [continueUrl]
 */

const docsUrl =
  'https://github.com/salesforce/analytics-embedding-example-apps-and-auth/blob/main/docs/how-to-get-frontdoor-url.md';

/**
 * @param {HTMLElement} host
 * @param {ErrorPanelOptions} opts
 */
export function renderErrorPanel(host, opts) {
  host.replaceChildren();
  const section = document.createElement('section');
  section.className = 'error-panel';
  section.setAttribute('role', 'alert');
  section.setAttribute('aria-live', 'assertive');

  const h2 = document.createElement('h2');
  h2.textContent = opts.title;

  const p = document.createElement('p');
  p.textContent = opts.detail;

  const actions = document.createElement('div');
  actions.className = 'error-panel__actions';

  if (opts.continueUrl) {
    const a = document.createElement('a');
    a.className = 'btn btn--primary';
    a.href = opts.continueUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = 'Continue verification';
    actions.append(a);
  }
  if (opts.onRetry) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn';
    btn.textContent = 'Retry';
    btn.addEventListener('click', opts.onRetry);
    actions.append(btn);
  }
  if (opts.onReset) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn';
    btn.textContent = 'Reset config';
    btn.addEventListener('click', opts.onReset);
    actions.append(btn);
  }

  const hint = document.createElement('p');
  hint.className = 'error-panel__hint';
  const hintLeading = document.createTextNode('Need a frontdoor URL? ');
  const link = document.createElement('a');
  link.href = docsUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Read the guide';
  const hintTrailing = document.createTextNode('.');
  hint.append(hintLeading, link, hintTrailing);

  section.append(h2, p, actions, hint);
  host.append(section);
}

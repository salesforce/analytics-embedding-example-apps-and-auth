/**
 * Single-document Vanilla example. Keeping setup and both routes in one page
 * means a one-time frontdoor URL is consumed once and never persisted.
 */
import { validateConfig } from './config.js';
import { initSdkOnce, findAuthRedirect } from './init.js';
import { messages } from './messages.js';
import { log } from './log.js';
import { renderErrorPanel } from './error-panel.js';
import { loadSdk } from './sdk-cdn.js';

/** @typedef {typeof import('@salesforce/analytics-embedding-sdk')} SdkModule */
/** @typedef {import('@salesforce/analytics-embedding-sdk').BootstrapResponse} BootstrapResponse */
/** @typedef {import('./types').AnalyticsEmbedElement} AnalyticsEmbedElement */

const form = /** @type {HTMLFormElement} */ (document.getElementById('config-form'));
const setupMain = /** @type {HTMLElement} */ (document.getElementById('setup-main'));
const appShell = /** @type {HTMLElement} */ (document.getElementById('app-shell'));
const routeHost = /** @type {HTMLElement} */ (document.getElementById('route-host'));
const errorHost = /** @type {HTMLElement} */ (document.getElementById('error-host'));
const status = /** @type {HTMLElement} */ (document.getElementById('status'));
const orgUrlInput = /** @type {HTMLInputElement} */ (document.getElementById('orgUrl'));
const authInput = /** @type {HTMLTextAreaElement} */ (document.getElementById('authCredential'));
const formError = /** @type {HTMLElement} */ (document.getElementById('form-error'));
const resetButton = /** @type {HTMLButtonElement} */ (document.getElementById('reset-button'));
const showcaseLink = /** @type {HTMLAnchorElement} */ (document.getElementById('showcase-link'));
const agentLink = /** @type {HTMLAnchorElement} */ (document.getElementById('agent-link'));
const skipLink = /** @type {HTMLAnchorElement} */ (document.getElementById('skip-link'));

/** @type {SdkModule | null} */
let sdkModule = null;
let ready = false;

const reset = () => location.assign(location.pathname);

/** @param {boolean} busy */
function setBusy(busy) {
  status.textContent = busy ? 'Connecting to your Salesforce org…' : '';
  if (busy) status.setAttribute('aria-busy', 'true');
  else status.removeAttribute('aria-busy');
  resetButton.disabled = busy;
}

/** @param {unknown} value */
function errorMessage(value) {
  if (value instanceof Error) return value.message;
  return typeof value === 'string' ? value : 'Unknown error';
}

/** @returns {'showcase' | 'agent'} */
function routeFromHash() {
  return location.hash === '#agent' ? 'agent' : 'showcase';
}

/** @param {'showcase' | 'agent'} route */
function renderRoute(route) {
  if (!ready || !sdkModule) return;
  const template = /** @type {HTMLTemplateElement} */ (
    document.getElementById(`${route}-template`)
  );
  const fragment = template.content.cloneNode(true);
  const elements = /** @type {DocumentFragment} */ (fragment).querySelectorAll(
    'analytics-dashboard, analytics-metric, analytics-visualization, analytics-agent',
  );

  for (const element of elements) {
    const embed = /** @type {AnalyticsEmbedElement} */ (element);
    embed.addEventListener(sdkModule.EventName.COMPONENT_LOADED, () =>
      embed.setAttribute('aria-busy', 'false'),
    );
    embed.addEventListener(sdkModule.EventName.ERROR, (event) => {
      log.error('SDK runtime error', {
        detail: /** @type {CustomEvent} */ (event).detail,
      });
      renderErrorPanel(errorHost, {
        title: 'Render failed',
        detail: messages.RENDER_FAILED(embed.getAttribute('id-or-api-name') || ''),
        onReset: reset,
      });
    });
  }

  routeHost.replaceChildren(fragment);
  if (route === 'showcase') {
    showcaseLink.setAttribute('aria-current', 'page');
    agentLink.removeAttribute('aria-current');
  } else {
    agentLink.setAttribute('aria-current', 'page');
    showcaseLink.removeAttribute('aria-current');
  }
  document.title = `${route === 'agent' ? 'Agent' : 'Showcase'} — Analytics Embedding SDK`;
}

function showReadyApp() {
  ready = true;
  setBusy(false);
  errorHost.replaceChildren();
  routeHost.hidden = false;
  renderRoute(routeFromHash());
}

/**
 * Handle both initializeAnalyticsSdk and retryOrAddOrgs responses. A retry can
 * itself return another AUTH_REDIRECT or a terminal failure.
 * @param {BootstrapResponse} response
 */
function handleResponse(response) {
  if (!sdkModule) return;
  setBusy(false);
  if (response.status === sdkModule.Status.SUCCESS) {
    showReadyApp();
    return;
  }

  const redirect = findAuthRedirect(sdkModule, response);
  if (redirect) {
    renderErrorPanel(errorHost, {
      title: 'Additional verification needed',
      detail: messages.AUTH_REDIRECT,
      continueUrl: redirect.continueUrl,
      onRetry: () => retryAuth(redirect.orgUrl),
      onReset: reset,
    });
    return;
  }

  renderErrorPanel(errorHost, {
    title: "Couldn't connect",
    detail: messages.INIT_FAILED(response.message || 'Unknown error'),
    onReset: reset,
  });
}

/** @param {string} orgUrl */
async function retryAuth(orgUrl) {
  if (!sdkModule) return;
  errorHost.replaceChildren();
  setBusy(true);
  try {
    const response = await sdkModule.retryOrAddOrgs([
      { orgUrl, authCredential: orgUrl },
    ]);
    handleResponse(response);
  } catch (error) {
    log.error('retryOrAddOrgs threw', { error });
    setBusy(false);
    renderErrorPanel(errorHost, {
      title: "Couldn't reconnect",
      detail: messages.INIT_FAILED(errorMessage(error)),
      onReset: reset,
    });
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.hidden = true;
  const config = {
    orgUrl: orgUrlInput.value.trim(),
    authCredential: authInput.value.trim(),
  };
  const validation = validateConfig(config);
  if (validation) {
    formError.textContent =
      validation === 'INVALID_ORG_URL'
        ? messages.INVALID_ORG_URL
        : 'Paste a frontdoor URL — this field is required.';
    formError.hidden = false;
    return;
  }

  // Remove the visible copy immediately. The local `config` object exists
  // only long enough for initializeAnalyticsSdk to consume it.
  authInput.value = '';
  setupMain.hidden = true;
  appShell.hidden = false;
  skipLink.href = '#app-main';
  routeHost.hidden = true;
  setBusy(true);

  try {
    const sdk = /** @type {SdkModule} */ (await loadSdk());
    sdkModule = sdk;
    const response = await initSdkOnce(config, sdk);
    config.authCredential = '';
    handleResponse(response);
  } catch (error) {
    config.authCredential = '';
    log.error('SDK initialization threw', { error });
    setBusy(false);
    renderErrorPanel(errorHost, {
      title: "Couldn't connect",
      detail: messages.INIT_FAILED(errorMessage(error)),
      onReset: reset,
    });
  }
});

resetButton.addEventListener('click', reset);
window.addEventListener('hashchange', () => renderRoute(routeFromHash()));

/**
 * agent.html entry script — mounts the AnalyticsAgent custom element after
 * SDK init.
 */
import { loadConfig, redirectIfUnconfigured, clearConfig } from './config.js';
import { initSdkOnce, findAuthRedirect } from './init.js';
import { messages } from './messages.js';
import { log } from './log.js';
import { renderNav } from './nav.js';
import { renderErrorPanel } from './error-panel.js';
import { loadSdk } from './sdk-cdn.js';

/** @typedef {import('./types').AnalyticsEmbedElement} AnalyticsEmbedElement */

redirectIfUnconfigured();
const navCtl = renderNav(
  /** @type {HTMLElement} */ (document.getElementById('app-header')),
  { active: 'agent' },
);

const config = loadConfig();
if (!config) throw new Error('unreachable: redirect should have fired');

const status = /** @type {HTMLElement} */ (document.getElementById('status'));
const errorHost = /** @type {HTMLElement} */ (document.getElementById('error-host'));
const agent = /** @type {AnalyticsEmbedElement} */ (document.getElementById('agent'));

const handleReset = () => {
  clearConfig();
  location.assign('./index.html');
};

/** @param {unknown} err */
const errMessage = (err) => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Unknown error';
};

status.setAttribute('aria-busy', 'true');
status.textContent = 'Connecting to your Salesforce org…';
navCtl.setResetDisabled(true);

loadSdk()
  .then((sdk) => initSdkOnce(config, sdk).then((response) => ({ sdk, response })))
  .then(({ sdk, response }) => {
    status.removeAttribute('aria-busy');
    status.textContent = '';
    navCtl.setResetDisabled(false);
    if (response.status === sdk.Status.SUCCESS) {
      requestAnimationFrame(() => agent.setAttribute('aria-busy', 'false'));
      agent.addEventListener(sdk.EventName.ERROR, (e) => {
        log.error('AnalyticsAgent runtime error', {
          detail: /** @type {CustomEvent} */ (e).detail,
        });
        renderErrorPanel(errorHost, {
          title: 'Render failed',
          detail: messages.RENDER_FAILED(agent.getAttribute('id-or-api-name') || ''),
          onReset: handleReset,
        });
      });
      return;
    }
    const redirectInfo = findAuthRedirect(sdk, response);
    if (redirectInfo) {
      const onRetry = () => {
        sdk
          .retryOrAddOrgs([
            { orgUrl: redirectInfo.orgUrl, authCredential: redirectInfo.orgUrl },
          ])
          .catch(/** @param {unknown} err */ (err) => {
            log.warn('retryOrAddOrgs rejected — falling back to reset', { err });
            handleReset();
          });
      };
      renderErrorPanel(errorHost, {
        title: 'Additional verification needed',
        detail: messages.AUTH_REDIRECT,
        continueUrl: redirectInfo.continueUrl,
        onRetry,
        onReset: handleReset,
      });
      return;
    }
    renderErrorPanel(errorHost, {
      title: "Couldn't connect",
      detail: messages.INIT_FAILED(response.message || 'Unknown error'),
      onReset: handleReset,
    });
  })
  .catch(
    /** @param {unknown} err */
    (err) => {
      log.error('init failed', { err });
      status.removeAttribute('aria-busy');
      status.textContent = '';
      navCtl.setResetDisabled(false);
      renderErrorPanel(errorHost, {
        title: "Couldn't connect",
        detail: messages.INIT_FAILED(errMessage(err)),
        onReset: handleReset,
      });
    },
  );

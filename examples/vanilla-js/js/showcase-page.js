/**
 * showcase.html entry script — initializes the SDK then mounts a dashboard,
 * a metric, and a visualization using the **HTML custom-element API**.
 *
 * Replace the id-or-api-name attributes in showcase.html with your own
 * org's assets.
 */
import { loadConfig, redirectIfUnconfigured, clearConfig } from './config.js';
import { initSdkOnce, findAuthRedirect } from './init.js';
import { messages } from './messages.js';
import { log } from './log.js';
import { renderNav } from './nav.js';
import { renderErrorPanel } from './error-panel.js';
import { loadSdk } from './sdk-cdn.js';

/** @typedef {import('./types').AnalyticsEmbedElement} AnalyticsEmbedElement */
/** @typedef {import('@salesforce/analytics-embedding-sdk').AnalyticsDashboard} AnalyticsDashboard */

redirectIfUnconfigured();
const navCtl = renderNav(
  /** @type {HTMLElement} */ (document.getElementById('app-header')),
  { active: 'showcase' },
);

const config = loadConfig();
if (!config) throw new Error('unreachable: redirect should have fired');

const status = /** @type {HTMLElement} */ (document.getElementById('status'));
const errorHost = /** @type {HTMLElement} */ (document.getElementById('error-host'));
const dashboard = /** @type {AnalyticsDashboard} */ (document.getElementById('dashboard'));
const metric = /** @type {AnalyticsEmbedElement} */ (document.getElementById('metric'));
const viz = /** @type {AnalyticsEmbedElement} */ (document.getElementById('viz'));
const filterBtn = /** @type {HTMLButtonElement} */ (document.getElementById('apply-filter'));

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

status.textContent = 'Connecting to your Salesforce org…';
status.setAttribute('aria-busy', 'true');
navCtl.setResetDisabled(true);

loadSdk()
  .then((sdk) => initSdkOnce(config, sdk).then((response) => ({ sdk, response })))
  .then(({ sdk, response }) => {
    status.removeAttribute('aria-busy');
    status.textContent = '';
    navCtl.setResetDisabled(false);

    if (response.status === sdk.Status.SUCCESS) {
      // Custom elements upgrade as soon as the SDK module loads. Once the
      // browser fires the upgrade, aria-busy can come off the embed hosts.
      /** @param {HTMLElement} el */
      const clearBusy = (el) => el.setAttribute('aria-busy', 'false');
      requestAnimationFrame(() => {
        clearBusy(dashboard);
        clearBusy(metric);
        clearBusy(viz);
      });

      filterBtn.disabled = false;
      filterBtn.addEventListener('click', () => {
        if (typeof dashboard.applyFilters === 'function') {
          dashboard.applyFilters([
            {
              fieldName: 'SalesData.Region',
              // FilterOperator is exported by the SDK at runtime — read from
              // the dynamically-loaded module.
              operator: sdk.FilterOperator.Equals,
              values: ['West'],
              dataSource: 'SalesData',
            },
          ]);
        }
      });

      // Wire EventName.ERROR on every embed so we don't silently drop
      // metric/visualization failures.
      /**
       * @param {AnalyticsEmbedElement} host
       * @param {Event} e
       */
      const onError = (host, e) => {
        log.error('SDK runtime error', { detail: /** @type {CustomEvent} */ (e).detail });
        renderErrorPanel(errorHost, {
          title: 'Render failed',
          detail: messages.RENDER_FAILED(host.getAttribute('id-or-api-name') || ''),
          onReset: handleReset,
        });
      };
      dashboard.addEventListener(sdk.EventName.ERROR, (e) => onError(dashboard, e));
      metric.addEventListener(sdk.EventName.ERROR, (e) => onError(metric, e));
      viz.addEventListener(sdk.EventName.ERROR, (e) => onError(viz, e));
      return;
    }
    // Look for an org in AUTH_REDIRECT state (multi-org map; in single-org
    // there is at most one entry).
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

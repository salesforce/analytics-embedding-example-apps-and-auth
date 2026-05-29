/**
 * index.html entry script — renders the setup form and persists the config.
 *
 * Vanilla's multi-page routing means we cannot fall back to in-memory
 * config: navigating to `showcase.html` is a fresh document. So when
 * `localStorage` is unavailable we disable Save and explain why. The React
 * and Angular variants tolerate private mode by holding config in memory.
 */
import {
  loadConfig,
  saveConfig,
  validateConfig,
  isStorageAvailable,
} from './config.js';
import { messages } from './messages.js';

const form = /** @type {HTMLFormElement} */ (document.getElementById('config-form'));
const orgUrlInput = /** @type {HTMLInputElement} */ (document.getElementById('orgUrl'));
const authInput = /** @type {HTMLTextAreaElement} */ (document.getElementById('authCredential'));
const errorEl = /** @type {HTMLElement} */ (document.getElementById('form-error'));
const storageWarn = /** @type {HTMLElement} */ (document.getElementById('storage-warning'));
const submitBtn = /** @type {HTMLButtonElement} */ (form.querySelector('button[type="submit"]'));

const storageOk = isStorageAvailable();

if (!storageOk) {
  storageWarn.textContent =
    messages.STORAGE_UNAVAILABLE +
    ' This example needs storage because routing crosses HTML files. Try a regular browser window.';
  storageWarn.hidden = false;
  submitBtn.disabled = true;
}

if (storageOk && loadConfig()) {
  // Already configured — jump straight to showcase.
  location.replace('./showcase.html');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!storageOk) return;
  errorEl.textContent = '';
  errorEl.hidden = true;

  const orgUrl = orgUrlInput.value;
  const authCredential = authInput.value;
  const validation = validateConfig({ orgUrl, authCredential });
  if (validation === 'INVALID_ORG_URL') {
    errorEl.textContent = messages.INVALID_ORG_URL;
    errorEl.hidden = false;
    return;
  }
  if (validation === 'EMPTY_AUTH_CREDENTIAL') {
    errorEl.textContent = 'Paste a frontdoor URL — this field is required.';
    errorEl.hidden = false;
    return;
  }
  saveConfig({ orgUrl, authCredential });
  location.assign('./showcase.html');
});

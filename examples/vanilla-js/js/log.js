/**
 * Tiny logger that no-ops outside dev. Detect dev by hostname so we don't
 * need a build step to swap behavior.
 */
const isDev =
  typeof location !== 'undefined' &&
  (location.hostname === 'localhost' || location.hostname === '127.0.0.1');

export const log = {
  /** @type {(msg: string, data?: unknown) => void} */
  info: (msg, data) => {
    if (isDev) console.info(`[analytics-sdk-demo] ${msg}`, data ?? '');
  },
  /** @type {(msg: string, data?: unknown) => void} */
  warn: (msg, data) => {
    if (isDev) console.warn(`[analytics-sdk-demo] ${msg}`, data ?? '');
  },
  /** @type {(msg: string, data?: unknown) => void} */
  error: (msg, data) => {
    console.error(`[analytics-sdk-demo] ${msg}`, data ?? '');
  },
};

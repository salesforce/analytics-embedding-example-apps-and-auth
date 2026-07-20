/**
 * Structured logger. No-ops in production builds so we ship zero
 * `console.log` noise. Use in dev for visibility into SDK lifecycle.
 */
const enabled = import.meta.env.DEV;

type LogFn = (msg: string, data?: Record<string, unknown>) => void;

export const log: { info: LogFn; error: LogFn } = {
  info: (msg, data) => {
    if (enabled) console.info(`[analytics-sdk-demo] ${msg}`, data ?? '');
  },
  // Errors always log so consumers can debug a deployed example.
  error: (msg, data) => {
    console.error(`[analytics-sdk-demo] ${msg}`, data ?? '');
  },
};

import { isDevMode } from '@angular/core';

type LogFn = (msg: string, data?: Record<string, unknown>) => void;

export const log: { info: LogFn; warn: LogFn; error: LogFn } = {
  info: (msg, data) => {
    if (isDevMode()) console.info(`[analytics-sdk-demo] ${msg}`, data ?? '');
  },
  warn: (msg, data) => {
    if (isDevMode()) console.warn(`[analytics-sdk-demo] ${msg}`, data ?? '');
  },
  error: (msg, data) => {
    console.error(`[analytics-sdk-demo] ${msg}`, data ?? '');
  },
};

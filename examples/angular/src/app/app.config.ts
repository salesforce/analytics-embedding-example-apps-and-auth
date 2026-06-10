import {
  type ApplicationConfig,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';

/**
 * Hash location strategy lets the SPA deploy to any static host without
 * server-side rewrite rules. Drop `withHashLocation()` if you serve from a
 * backend that can fall back to index.html for unknown paths.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
  ],
};

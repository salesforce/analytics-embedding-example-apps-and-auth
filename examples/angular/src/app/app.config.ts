import {
  type ApplicationConfig,
  provideZoneChangeDetection,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';

/**
 * Hash location strategy makes the GitHub Pages deploy work without server
 * rewrite rules. Drop `withHashLocation()` if you serve from a backend that
 * can fall back to index.html for unknown paths.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
  ],
};

export { CUSTOM_ELEMENTS_SCHEMA };

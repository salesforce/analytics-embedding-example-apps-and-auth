import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ConfigService } from './config.service';

/**
 * Functional canActivate guard. Redirects to /setup if no config is saved.
 */
export const configGuard: CanActivateFn = () => {
  const config = inject(ConfigService);
  const router = inject(Router);
  if (config.config()) return true;
  return router.createUrlTree(['/setup']);
};

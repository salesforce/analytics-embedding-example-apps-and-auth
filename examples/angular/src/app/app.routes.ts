import type { Routes } from '@angular/router';
import { configGuard } from './config.guard';

export const routes: Routes = [
  {
    path: 'setup',
    loadComponent: () =>
      import('./routes/setup.component').then((m) => m.SetupComponent),
  },
  {
    path: '',
    canActivate: [configGuard],
    loadComponent: () =>
      import('./routes/showcase.component').then((m) => m.ShowcaseComponent),
    pathMatch: 'full',
  },
  {
    path: 'agent',
    canActivate: [configGuard],
    loadComponent: () =>
      import('./routes/agent.component').then((m) => m.AgentComponent),
  },
  { path: '**', redirectTo: '' },
];

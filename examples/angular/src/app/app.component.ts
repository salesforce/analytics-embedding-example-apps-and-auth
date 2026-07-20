import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ConfigService } from './config.service';
import { ErrorPanelComponent } from './error-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ErrorPanelComponent],
  template: `
    <div class="app">
      @if (showShell()) {
        <header class="app-header">
          <div class="app-header__brand">
            <strong>Analytics Embedding SDK</strong>
            <span class="app-header__tag">Angular 22 example</span>
          </div>
          <nav aria-label="Primary">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Showcase</a>
            <a routerLink="/agent" routerLinkActive="active">Agent</a>
          </nav>
          <button
            type="button"
            class="btn btn--ghost"
            [disabled]="state().kind === 'initializing'"
            (click)="reset()"
          >
            Reset config
          </button>
        </header>
      }

      @if (state().kind === 'initializing') {
        <p class="loading" role="status" aria-busy="true">Connecting to your Salesforce org…</p>
      }

      @if (errorState(); as e) {
        <app-error-panel
          [title]="e.title"
          [detail]="e.detail"
          [continueUrl]="e.continueUrl"
          [onReset]="resetFn"
          [onRetry]="e.canRetry ? retryFn : undefined"
        ></app-error-panel>
      }

      <!--
        Gate the outlet like React gates its <Outlet>: setup (unconfigured)
        always renders, but the embed routes wait for a ready session so their
        components can mount assuming init has succeeded.
      -->
      @if (showOutlet()) {
        <router-outlet></router-outlet>
      }
    </div>
  `,
})
export class AppComponent {
  private readonly config = inject(ConfigService);

  readonly state = this.config.state;

  constructor() {
    // Initialize the SDK once, in the shell, as soon as a config exists — the
    // same place React runs initSdkOnce(). Route components no longer init
    // themselves; they mount embeds assuming a ready session.
    effect(() => {
      if (this.config.config() && this.state().kind === 'idle') {
        void this.config.initOnce();
      }
    });
  }

  readonly errorState = computed(() => {
    const s = this.state();
    return s.kind === 'error' ? s : null;
  });

  /** True for routes that should show the shell. Setup hides it. */
  readonly showShell = computed(() => !!this.config.config());

  /**
   * Setup (no config yet) always renders; the embed routes wait until the
   * session is ready so their components can assume init succeeded.
   */
  readonly showOutlet = computed(
    () => !this.config.config() || this.state().kind === 'ready',
  );

  // Bound function refs so the template doesn't recreate them on each CD pass.
  readonly resetFn = (): void => this.reset();
  readonly retryFn = (): void => this.retry();

  reset(): void {
    this.config.clear();
    // Full reload clears the SDK module's internal state. Without this,
    // re-init would silently reuse stale state from the prior session.
    location.assign(location.pathname + location.search);
  }

  retry(): void {
    const s = this.state();
    if (s.kind !== 'error' || !s.retryOrgUrl) {
      this.reset();
      return;
    }
    void this.config.retryAuth(s.retryOrgUrl);
  }
}

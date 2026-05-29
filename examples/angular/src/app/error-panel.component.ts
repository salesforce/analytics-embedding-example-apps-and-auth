import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-panel',
  standalone: true,
  template: `
    <section class="error-panel" role="alert" aria-live="assertive">
      <h2>{{ title }}</h2>
      <p>{{ detail }}</p>
      <div class="error-panel__actions">
        @if (continueUrl) {
          <a class="btn btn--primary" [href]="continueUrl" target="_blank" rel="noopener noreferrer">
            Continue verification
          </a>
        }
        @if (onRetry) {
          <button type="button" class="btn" (click)="onRetry!()">Retry</button>
        }
        @if (onReset) {
          <button type="button" class="btn" (click)="onReset!()">Reset config</button>
        }
      </div>
      <p class="error-panel__hint">
        Need a frontdoor URL?
        <a
          href="https://github.com/salesforce/analytics-embedding-example-apps-and-auth/blob/main/docs/how-to-get-frontdoor-url.md"
          target="_blank"
          rel="noopener noreferrer"
          >Read the guide</a
        >.
      </p>
    </section>
  `,
})
export class ErrorPanelComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) detail!: string;
  @Input() continueUrl?: string;
  @Input() onReset?: () => void;
  @Input() onRetry?: () => void;
}

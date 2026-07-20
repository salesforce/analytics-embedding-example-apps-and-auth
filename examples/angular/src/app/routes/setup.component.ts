import { Component, type OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfigService, type ValidationError } from '../config.service';
import { messages } from '../messages';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main id="main" class="setup">
      <header>
        <h1>Configure the demo</h1>
        <p>
          This example needs a Salesforce org URL, asset IDs or API names, and
          a frontdoor URL to establish a session.
          <a
            href="https://github.com/salesforce/analytics-embedding-example-apps-and-auth/blob/main/docs/how-to-get-frontdoor-url.md"
            target="_blank"
            rel="noopener noreferrer"
            >How do I get these?</a
          >
        </p>
      </header>

      <form (submit)="onSubmit($event)" novalidate>
        <div class="field">
          <label for="orgUrl">Org URL (Lightning)</label>
          <input
            id="orgUrl"
            name="orgUrl"
            type="url"
            placeholder="https://yourorg.lightning.force.com"
            autocomplete="off"
            spellcheck="false"
            [(ngModel)]="orgUrl"
            required
          />
        </div>

        <h2>Assets to embed</h2>
        <p class="hint">
          Enter at least one asset ID or API name.
        </p>

        <div class="field">
          <label for="dashboard">Dashboard ID or API name</label>
          <input
            id="dashboard"
            name="dashboard"
            placeholder="YourDashboardApiName"
            autocomplete="off"
            spellcheck="false"
            [(ngModel)]="dashboard"
          />
        </div>

        <div class="field">
          <label for="metric">Metric ID or API name</label>
          <input
            id="metric"
            name="metric"
            placeholder="YourMetricApiName"
            autocomplete="off"
            spellcheck="false"
            [(ngModel)]="metric"
          />
        </div>

        <div class="field">
          <label for="visualization">Visualization ID or API name</label>
          <input
            id="visualization"
            name="visualization"
            placeholder="YourVisualizationApiName"
            autocomplete="off"
            spellcheck="false"
            [(ngModel)]="visualization"
          />
        </div>

        <div class="field">
          <label for="agent">Analytics Agent ID or API name</label>
          <input
            id="agent"
            name="agent"
            placeholder="YourAnalyticsAgentApiName"
            autocomplete="off"
            spellcheck="false"
            [(ngModel)]="agent"
          />
        </div>

        <div class="field">
          <label for="authCredential">Frontdoor URL (auth credential)</label>
          <textarea
            id="authCredential"
            name="authCredential"
            rows="4"
            placeholder="Paste a freshly generated frontdoor URL"
            autocomplete="off"
            spellcheck="false"
            [(ngModel)]="authCredential"
            required
          ></textarea>
        </div>

        @if (error() === 'INVALID_ORG_URL') {
          <p class="error" role="alert">{{ msg.INVALID_ORG_URL }}</p>
        }
        @if (error() === 'EMPTY_AUTH_CREDENTIAL') {
          <p class="error" role="alert">Paste a frontdoor URL — this field is required.</p>
        }
        @if (error() === 'EMPTY_ASSET_CONFIG') {
          <p class="error" role="alert">Enter at least one asset ID or API name.</p>
        }

        <p class="hint">
          <strong>Demo only.</strong> Use a sandbox org. This configuration
          stays in memory and is discarded when you reload or reset the page.
        </p>

        <button type="submit" class="btn btn--primary">Connect</button>
      </form>
    </main>
  `,
})
export class SetupComponent implements OnInit {
  protected readonly config = inject(ConfigService);
  private readonly router = inject(Router);

  protected readonly msg = messages;
  protected orgUrl = '';
  protected authCredential = '';
  protected dashboard = '';
  protected metric = '';
  protected visualization = '';
  protected agent = '';
  protected readonly error = signal<ValidationError | null>(null);

  ngOnInit(): void {
    // If we already have config, jump to showcase.
    if (this.config.config()) this.router.navigateByUrl('/');
  }

  onSubmit(e: Event): void {
    e.preventDefault();
    const v = this.config.validate({
      orgUrl: this.orgUrl,
      authCredential: this.authCredential,
      assets: {
        dashboard: this.dashboard,
        metric: this.metric,
        visualization: this.visualization,
        agent: this.agent,
      },
    });
    if (v) {
      this.error.set(v);
      return;
    }
    this.error.set(null);
    this.config.save({
      orgUrl: this.orgUrl,
      authCredential: this.authCredential,
      assets: {
        dashboard: this.dashboard,
        metric: this.metric,
        visualization: this.visualization,
        agent: this.agent,
      },
    });
    this.router.navigateByUrl('/');
  }
}

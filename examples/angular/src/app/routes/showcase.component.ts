import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  signal,
} from '@angular/core';
import {
  AnalyticsDashboard,
  AnalyticsMetric,
  AnalyticsVisualization,
  EventName,
} from '@salesforce/analytics-embedding-sdk';
import { messages } from '../messages';
import { log } from '../log';

const ASSETS = {
  dashboard: 'YourDashboardApiName',
  metric: 'YourMetricApiName',
  visualization: 'YourVisualizationApiName',
} as const;

@Component({
  selector: 'app-showcase',
  standalone: true,
  template: `
    <main id="main" class="showcase">
      <header class="page-header">
        <h1>Showcase</h1>
        <p>
          A dashboard, a metric, and a single visualization rendered side by side
          using the SDK's class API.
        </p>
      </header>

      @if (renderError(); as msg) {
        <p class="error" role="alert">{{ msg }}</p>
      }

      <div class="showcase__grid">
        <section
          #dashHost
          role="region"
          aria-label="Sales dashboard"
          aria-busy="true"
          class="embed embed--dashboard"
        ></section>
        <section
          #metricHost
          role="region"
          aria-label="Headline metric"
          aria-busy="true"
          class="embed embed--metric"
        ></section>
        <section
          #vizHost
          role="region"
          aria-label="Single visualization"
          aria-busy="true"
          class="embed embed--viz"
        ></section>
      </div>
    </main>
  `,
})
export class ShowcaseComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dashHost') dashHost!: ElementRef<HTMLElement>;
  @ViewChild('metricHost') metricHost!: ElementRef<HTMLElement>;
  @ViewChild('vizHost') vizHost!: ElementRef<HTMLElement>;

  private dash: AnalyticsDashboard | null = null;
  private metric: AnalyticsMetric | null = null;
  private viz: AnalyticsVisualization | null = null;
  private mounted = false;

  protected readonly renderError = signal<string | null>(null);

  ngAfterViewInit(): void {
    this.mounted = true;
    // The shell (AppComponent) gates this route on a ready session, so we can
    // mount embeds directly — no init or ready-check needed here.
    const dashHost = this.dashHost.nativeElement;
    const metricHost = this.metricHost.nativeElement;
    const vizHost = this.vizHost.nativeElement;

    this.dash = new AnalyticsDashboard({
      idOrApiName: ASSETS.dashboard,
      parentIdOrElement: dashHost,
    });
    this.metric = new AnalyticsMetric({
      idOrApiName: ASSETS.metric,
      parentIdOrElement: metricHost,
    });
    this.viz = new AnalyticsVisualization({
      idOrApiName: ASSETS.visualization,
      parentIdOrElement: vizHost,
    });

    const reportError = (assetName: string): void => {
      if (!this.mounted) return;
      log.error('SDK runtime error', { assetName });
      this.renderError.set(messages.RENDER_FAILED(assetName));
    };

    this.dash.addEventListener(EventName.ERROR, () =>
      reportError(ASSETS.dashboard),
    );
    this.metric.addEventListener(EventName.ERROR, () =>
      reportError(ASSETS.metric),
    );
    this.viz.addEventListener(EventName.ERROR, () =>
      reportError(ASSETS.visualization),
    );

    const renderOne = (
      name: string,
      el: AnalyticsDashboard | AnalyticsMetric | AnalyticsVisualization,
      host: HTMLElement,
    ): Promise<void> =>
      el
        .render()
        .then(() => {
          if (this.mounted) host.setAttribute('aria-busy', 'false');
        })
        .catch((err: unknown) => {
          log.error('render() rejected', { name, err });
          reportError(name);
        });

    void Promise.all([
      renderOne(ASSETS.dashboard, this.dash, dashHost),
      renderOne(ASSETS.metric, this.metric, metricHost),
      renderOne(ASSETS.visualization, this.viz, vizHost),
    ]);
  }

  ngOnDestroy(): void {
    this.mounted = false;
    this.dash?.remove();
    this.metric?.remove();
    this.viz?.remove();
    this.dash = null;
    this.metric = null;
    this.viz = null;
  }
}

import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
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
import { ConfigService } from '../config.service';

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
          [attr.aria-busy]="!!assets.dashboard"
          class="embed embed--dashboard"
          [class.embed--empty]="!assets.dashboard"
        >
          @if (!assets.dashboard) { <p class="hint">Dashboard not configured.</p> }
        </section>
        <section
          #metricHost
          role="region"
          aria-label="Headline metric"
          [attr.aria-busy]="!!assets.metric"
          class="embed embed--metric"
          [class.embed--empty]="!assets.metric"
        >
          @if (!assets.metric) { <p class="hint">Metric not configured.</p> }
        </section>
        <section
          #vizHost
          role="region"
          aria-label="Single visualization"
          [attr.aria-busy]="!!assets.visualization"
          class="embed embed--viz"
          [class.embed--empty]="!assets.visualization"
        >
          @if (!assets.visualization) { <p class="hint">Visualization not configured.</p> }
        </section>
      </div>
    </main>
  `,
})
export class ShowcaseComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dashHost') dashHost!: ElementRef<HTMLElement>;
  @ViewChild('metricHost') metricHost!: ElementRef<HTMLElement>;
  @ViewChild('vizHost') vizHost!: ElementRef<HTMLElement>;

  protected readonly assets = inject(ConfigService).config()!.assets;

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

    const reportError = (assetName: string): void => {
      if (!this.mounted) return;
      log.error('SDK runtime error', { assetName });
      this.renderError.set(messages.RENDER_FAILED(assetName));
    };

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

    const renders: Promise<void>[] = [];
    if (this.assets.dashboard) {
      this.dash = new AnalyticsDashboard({
        idOrApiName: this.assets.dashboard,
        parentIdOrElement: dashHost,
      });
      this.dash.addEventListener(EventName.ERROR, () =>
        reportError(this.assets.dashboard),
      );
      renders.push(renderOne(this.assets.dashboard, this.dash, dashHost));
    }
    if (this.assets.metric) {
      this.metric = new AnalyticsMetric({
        idOrApiName: this.assets.metric,
        parentIdOrElement: metricHost,
      });
      this.metric.addEventListener(EventName.ERROR, () =>
        reportError(this.assets.metric),
      );
      renders.push(renderOne(this.assets.metric, this.metric, metricHost));
    }
    if (this.assets.visualization) {
      this.viz = new AnalyticsVisualization({
        idOrApiName: this.assets.visualization,
        parentIdOrElement: vizHost,
      });
      this.viz.addEventListener(EventName.ERROR, () =>
        reportError(this.assets.visualization),
      );
      renders.push(renderOne(this.assets.visualization, this.viz, vizHost));
    }
    void Promise.all(renders);
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

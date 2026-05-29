import { useEffect, useRef, useState } from 'react';
import {
  AnalyticsDashboard,
  AnalyticsMetric,
  AnalyticsVisualization,
  EventName,
  FilterOperator,
} from '@salesforce/analytics-embedding-sdk';
import { messages } from '../lib/messages';
import { log } from '../lib/log';

/**
 * Demonstrates Dashboard + Metric + Visualization on one page using the
 * **class API**. Each instance is itself a custom HTMLElement; we hand it
 * a parent container via `parentIdOrElement` and call `render()`.
 *
 * Replace the `idOrApiName` values below with assets from your own org.
 * For the Apply Filter demo, update `FILTER_FIELD_NAME` and `FILTER_VALUE`
 * to a field that exists on your dashboard's data source.
 */
const ASSETS = {
  dashboard: 'YourDashboardApiName',
  metric: 'YourMetricApiName',
  visualization: 'YourVisualizationApiName',
} as const;

const FILTER_FIELD_NAME = 'SalesData.Region';
const FILTER_VALUE = 'West';
const FILTER_DATA_SOURCE = 'SalesData';

export function Showcase(): React.ReactElement {
  const dashHost = useRef<HTMLDivElement | null>(null);
  const metricHost = useRef<HTMLDivElement | null>(null);
  const vizHost = useRef<HTMLDivElement | null>(null);
  const dashboardInstance = useRef<AnalyticsDashboard | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!dashHost.current || !metricHost.current || !vizHost.current) return;
    let mounted = true;

    const dash = new AnalyticsDashboard({
      idOrApiName: ASSETS.dashboard,
      parentIdOrElement: dashHost.current,
    });
    const metric = new AnalyticsMetric({
      idOrApiName: ASSETS.metric,
      parentIdOrElement: metricHost.current,
    });
    const viz = new AnalyticsVisualization({
      idOrApiName: ASSETS.visualization,
      parentIdOrElement: vizHost.current,
    });

    dashboardInstance.current = dash;

    const reportError = (assetName: string): void => {
      if (!mounted) return;
      log.error('SDK runtime error', { assetName });
      setRenderError(messages.RENDER_FAILED(assetName));
    };

    dash.addEventListener(EventName.ERROR, () => reportError(ASSETS.dashboard));
    metric.addEventListener(EventName.ERROR, () => reportError(ASSETS.metric));
    viz.addEventListener(EventName.ERROR, () =>
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
          if (mounted) host.setAttribute('aria-busy', 'false');
        })
        .catch((err: unknown) => {
          log.error('render() rejected', { name, err });
          reportError(name);
        });

    void Promise.all([
      renderOne(ASSETS.dashboard, dash, dashHost.current),
      renderOne(ASSETS.metric, metric, metricHost.current),
      renderOne(ASSETS.visualization, viz, vizHost.current),
    ]);

    return () => {
      mounted = false;
      // The SDK instance IS the embedded HTMLElement. Detaching from the DOM
      // is the cleanup.
      dash.remove();
      metric.remove();
      viz.remove();
      dashboardInstance.current = null;
    };
  }, []);

  const applyDemoFilter = (): void => {
    const dash = dashboardInstance.current;
    if (!dash) return;
    void dash
      .applyFilters([
        {
          fieldName: FILTER_FIELD_NAME,
          operator: FilterOperator.Equals,
          values: [FILTER_VALUE],
          dataSource: FILTER_DATA_SOURCE,
        },
      ])
      .catch((err: unknown) => {
        log.warn('applyFilters rejected', { err });
      });
  };

  return (
    <main id="main" className="showcase">
      <title>Showcase — Analytics Embedding SDK example</title>
      <header className="page-header">
        <h1>Showcase</h1>
        <p>
          A dashboard, a metric, and a single visualization rendered side by
          side. Click <em>Apply demo filter</em> to push a filter into the
          dashboard programmatically.
        </p>
      </header>

      <div className="showcase__actions">
        <button type="button" className="btn" onClick={applyDemoFilter}>
          Apply demo filter ({FILTER_FIELD_NAME} = {FILTER_VALUE})
        </button>
      </div>

      {renderError ? (
        <p className="error" role="alert">
          {renderError}
        </p>
      ) : null}

      <div className="showcase__grid">
        <section
          ref={dashHost}
          role="region"
          aria-label="Sales dashboard"
          aria-busy="true"
          className="embed embed--dashboard"
        />
        <section
          ref={metricHost}
          role="region"
          aria-label="Headline metric"
          aria-busy="true"
          className="embed embed--metric"
        />
        <section
          ref={vizHost}
          role="region"
          aria-label="Single visualization"
          aria-busy="true"
          className="embed embed--viz"
        />
      </div>
    </main>
  );
}

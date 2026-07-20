import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AnalyticsDashboard,
  AnalyticsMetric,
  AnalyticsVisualization,
  EventName,
} from '@salesforce/analytics-embedding-sdk';
import { messages } from '../lib/messages';
import { log } from '../lib/log';
import type { AssetConfig } from '../lib/config';

/**
 * Demonstrates Dashboard + Metric + Visualization on one page using the
 * **class API**. Each instance is itself a custom HTMLElement; we hand it
 * a parent container via `parentIdOrElement` and call `render()`.
 *
 * Asset IDs come from the in-memory setup form.
 */
export function Showcase(): React.ReactElement {
  const assets = useOutletContext<AssetConfig>();
  const dashHost = useRef<HTMLDivElement | null>(null);
  const metricHost = useRef<HTMLDivElement | null>(null);
  const vizHost = useRef<HTMLDivElement | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!dashHost.current || !metricHost.current || !vizHost.current) return;
    let mounted = true;
    const embeds: Array<{
      name: string;
      element: AnalyticsDashboard | AnalyticsMetric | AnalyticsVisualization;
      host: HTMLElement;
    }> = [];

    const reportError = (assetName: string): void => {
      if (!mounted) return;
      log.error('SDK runtime error', { assetName });
      setRenderError(messages.RENDER_FAILED(assetName));
    };

    if (assets.dashboard) {
      const element = new AnalyticsDashboard({
        idOrApiName: assets.dashboard,
        parentIdOrElement: dashHost.current,
      });
      element.addEventListener(EventName.ERROR, () =>
        reportError(assets.dashboard),
      );
      embeds.push({ name: assets.dashboard, element, host: dashHost.current });
    }
    if (assets.metric) {
      const element = new AnalyticsMetric({
        idOrApiName: assets.metric,
        parentIdOrElement: metricHost.current,
      });
      element.addEventListener(EventName.ERROR, () =>
        reportError(assets.metric),
      );
      embeds.push({ name: assets.metric, element, host: metricHost.current });
    }
    if (assets.visualization) {
      const element = new AnalyticsVisualization({
        idOrApiName: assets.visualization,
        parentIdOrElement: vizHost.current,
      });
      element.addEventListener(EventName.ERROR, () =>
        reportError(assets.visualization),
      );
      embeds.push({
        name: assets.visualization,
        element,
        host: vizHost.current,
      });
    }

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

    void Promise.all(
      embeds.map(({ name, element, host }) => renderOne(name, element, host)),
    );

    return () => {
      mounted = false;
      // The SDK instance IS the embedded HTMLElement. Detaching from the DOM
      // is the cleanup.
      embeds.forEach(({ element }) => element.remove());
    };
  }, [assets.dashboard, assets.metric, assets.visualization]);

  return (
    <main id="main" className="showcase">
      <title>Showcase — Analytics Embedding SDK example</title>
      <header className="page-header">
        <h1>Showcase</h1>
        <p>
          A dashboard, a metric, and a single visualization rendered side by
          side using the SDK's class API.
        </p>
      </header>

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
          aria-busy={Boolean(assets.dashboard)}
          className={`embed embed--dashboard${!assets.dashboard ? ' embed--empty' : ''}`}
        >
          {!assets.dashboard ? <p className="hint">Dashboard not configured.</p> : null}
        </section>
        <section
          ref={metricHost}
          role="region"
          aria-label="Headline metric"
          aria-busy={Boolean(assets.metric)}
          className={`embed embed--metric${!assets.metric ? ' embed--empty' : ''}`}
        >
          {!assets.metric ? <p className="hint">Metric not configured.</p> : null}
        </section>
        <section
          ref={vizHost}
          role="region"
          aria-label="Single visualization"
          aria-busy={Boolean(assets.visualization)}
          className={`embed embed--viz${!assets.visualization ? ' embed--empty' : ''}`}
        >
          {!assets.visualization ? (
            <p className="hint">Visualization not configured.</p>
          ) : null}
        </section>
      </div>
    </main>
  );
}

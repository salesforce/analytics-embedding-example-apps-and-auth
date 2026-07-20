/**
 * Ambient type declarations for the SDK's HTML custom elements. The SDK is
 * loaded from a CDN at runtime, so we never `import` it from JS — but we
 * pull in its types via a type-only import below.
 *
 * The SDK is in `devDependencies` so `npm run typecheck` can resolve it.
 */
import type {
  AnalyticsDashboard,
  AnalyticsMetric,
  AnalyticsVisualization,
} from '@salesforce/analytics-embedding-sdk';

/**
 * Element-typed aliases for the SDK's custom elements. Each instance IS the
 * web component; we use these to give DOM query results the right
 * methods at typecheck time.
 */
export type AnalyticsEmbedElement =
  | AnalyticsDashboard
  | AnalyticsMetric
  | AnalyticsVisualization;

declare global {
  interface HTMLElementTagNameMap {
    'analytics-dashboard': AnalyticsDashboard;
    'analytics-metric': AnalyticsMetric;
    'analytics-visualization': AnalyticsVisualization;
  }
}

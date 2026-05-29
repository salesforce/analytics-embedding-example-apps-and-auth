/**
 * Ambient type declarations for the SDK's HTML custom elements. The SDK is
 * loaded from a CDN at runtime, so we never `import` it from JS — but we
 * pull in its types via a type-only import below for accurate filter shape.
 *
 * The SDK is in `devDependencies` so `npm run typecheck` can resolve it.
 */
import type {
  AnalyticsAgent,
  AnalyticsDashboard,
  AnalyticsMetric,
  AnalyticsVisualization,
  UnifiedFilterJson,
} from '@salesforce/analytics-embedding-sdk';

/** Re-export so JSDoc can `@typedef` this without re-importing every file. */
export type AnalyticsFilter = UnifiedFilterJson;

/**
 * Element-typed aliases for the SDK's custom elements. Each instance IS the
 * web component; we use these to give `getElementById` results the right
 * methods (applyFilters, render, etc.) at typecheck time.
 */
export type AnalyticsEmbedElement =
  | AnalyticsDashboard
  | AnalyticsMetric
  | AnalyticsVisualization
  | AnalyticsAgent;

declare global {
  interface HTMLElementTagNameMap {
    'analytics-dashboard': AnalyticsDashboard;
    'analytics-metric': AnalyticsMetric;
    'analytics-visualization': AnalyticsVisualization;
    'analytics-agent': AnalyticsAgent;
  }
}

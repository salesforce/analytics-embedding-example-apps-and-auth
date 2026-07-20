/**
 * SDK mock used by the unit tests. Loaded from `src/test/setup.ts` so tests
 * never hit a real Salesforce org. The shape mirrors the SDK surface used by
 * the application.
 */
import { vi } from 'vitest';

export const Status = {
  SUCCESS: 'Success',
  FAILURE: 'Failure',
  PARTIAL_SUCCESS: 'Partial Success',
} as const;
export const OrgStates = {
  READY_FOR_INIT: 'READY_FOR_INIT',
  INITIALIZATION_SUCCESS: 'INITIALIZATION_SUCCESS',
  INITIALIZATION_ERROR: 'INITIALIZATION_ERROR',
  AUTH_REDIRECT: 'AUTH_REDIRECT',
  LOGGED_OUT: 'LOGGED_OUT',
  LOGGED_OUT_FAILURE: 'LOGGED_OUT_FAILURE',
} as const;
export const EventName = { ERROR: 'Error', COMPONENT_LOADED: 'ComponentLoaded' } as const;

export const initializeAnalyticsSdk = vi.fn().mockResolvedValue({
  status: Status.SUCCESS,
  message: 'ok',
});

export const retryOrAddOrgs = vi.fn().mockResolvedValue({
  status: Status.SUCCESS,
  message: 'ok',
});

class FakeEmbed extends HTMLElement {
  render = vi.fn().mockResolvedValue('rendered');
  constructor(public _props?: unknown) {
    super();
  }
}
// Register so the test environment can construct without complaint.
if (typeof customElements !== 'undefined' && !customElements.get('test-fake-embed')) {
  customElements.define('test-fake-embed', class extends HTMLElement {});
}

export const AnalyticsDashboard = FakeEmbed;
export const AnalyticsMetric = FakeEmbed;
export const AnalyticsVisualization = FakeEmbed;
export const AnalyticsAgent = FakeEmbed;

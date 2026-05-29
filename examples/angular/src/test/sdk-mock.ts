/**
 * SDK mock used by Jest. Resolved via jest.config.js `moduleNameMapper`.
 * Tests should never hit a real Salesforce org. The shape mirrors the real
 * SDK closely enough for typecheck + smoke tests.
 */
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
export const FilterOperator = { Equals: 'Equals', In: 'In' } as const;

export const initializeAnalyticsSdk = jest.fn().mockResolvedValue({
  status: Status.SUCCESS,
  message: 'ok',
});

export const retryOrAddOrgs = jest.fn().mockResolvedValue({
  status: Status.SUCCESS,
  message: 'ok',
});

export const logout = jest.fn().mockResolvedValue({
  status: Status.SUCCESS,
  message: 'ok',
});

export const analyticsEventTarget = new EventTarget();

class FakeEmbed extends HTMLElement {
  render = jest.fn().mockResolvedValue('rendered');
  reload = jest.fn().mockResolvedValue(undefined);
  applyFilters = jest.fn().mockResolvedValue(undefined);
  getFilters = jest.fn().mockResolvedValue([]);
  clearFilters = jest.fn().mockResolvedValue(undefined);
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

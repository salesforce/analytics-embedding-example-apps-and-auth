import '@testing-library/jest-dom/vitest';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Mock the Analytics Embedding SDK at module boundary. Tests should never
// hit a real Salesforce org. Shape mirrors the real surface closely.
vi.mock('@salesforce/analytics-embedding-sdk', () => {
  const Status = {
    SUCCESS: 'Success',
    FAILURE: 'Failure',
    PARTIAL_SUCCESS: 'Partial Success',
  } as const;
  const OrgStates = {
    READY_FOR_INIT: 'READY_FOR_INIT',
    INITIALIZATION_SUCCESS: 'INITIALIZATION_SUCCESS',
    INITIALIZATION_ERROR: 'INITIALIZATION_ERROR',
    AUTH_REDIRECT: 'AUTH_REDIRECT',
    LOGGED_OUT: 'LOGGED_OUT',
    LOGGED_OUT_FAILURE: 'LOGGED_OUT_FAILURE',
  } as const;
  const EventName = { ERROR: 'Error', COMPONENT_LOADED: 'ComponentLoaded' } as const;
  const FilterOperator = { Equals: 'Equals', In: 'In' } as const;

  class FakeEmbed extends HTMLElement {
    render = vi.fn().mockResolvedValue('rendered');
    reload = vi.fn().mockResolvedValue(undefined);
    applyFilters = vi.fn().mockResolvedValue(undefined);
    getFilters = vi.fn().mockResolvedValue([]);
    clearFilters = vi.fn().mockResolvedValue(undefined);
  }

  return {
    Status,
    OrgStates,
    EventName,
    FilterOperator,
    initializeAnalyticsSdk: vi
      .fn()
      .mockResolvedValue({ status: Status.SUCCESS, message: 'ok' }),
    retryOrAddOrgs: vi
      .fn()
      .mockResolvedValue({ status: Status.SUCCESS, message: 'ok' }),
    logout: vi
      .fn()
      .mockResolvedValue({ status: Status.SUCCESS, message: 'ok' }),
    analyticsEventTarget: new EventTarget(),
    AnalyticsDashboard: FakeEmbed,
    AnalyticsMetric: FakeEmbed,
    AnalyticsVisualization: FakeEmbed,
    AnalyticsAgent: FakeEmbed,
  };
});

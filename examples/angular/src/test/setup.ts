import { afterEach, vi } from 'vitest';

// Redirect the real SDK to our fake for every test — the Vitest equivalent of
// the old Jest `moduleNameMapper`. Type-only imports still resolve to the real
// package, so production code keeps accurate types.
vi.mock('@salesforce/analytics-embedding-sdk', () =>
  import('./sdk-mock'),
);

// The @angular/build:unit-test builder initializes the Angular TestBed before
// these setup files run, so we only need cross-test cleanup here.
afterEach(() => {
  vi.clearAllMocks();
});

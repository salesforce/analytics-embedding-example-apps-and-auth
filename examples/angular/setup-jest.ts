import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

afterEach(() => {
  localStorage.clear();
});

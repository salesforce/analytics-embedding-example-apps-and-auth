/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  globalSetup: 'jest-preset-angular/global-setup',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  moduleNameMapper: {
    '^@salesforce/analytics-embedding-sdk$': '<rootDir>/src/test/sdk-mock.ts',
  },
};

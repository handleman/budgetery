module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: ['node_modules/(?!.*\\.s?css)$'],
  setupFiles: ['./jest.setup.js'],
  // Playwright E2E specs live in e2e/ and use the @playwright/test runner.
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
};

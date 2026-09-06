module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: ['node_modules/(?!.*\\.s?css)$'],
  setupFiles: ['./jest.setup.js'],
};

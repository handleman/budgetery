export default {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/react-native/jest'],
  testEnvironment: 'jsdom',
};

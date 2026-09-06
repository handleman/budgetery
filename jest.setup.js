// Global Jest setup: mock native AsyncStorage with the library's official
// in-memory mock so suites run without native modules.
// See https://react-native-async-storage.github.io/async-storage/docs/advanced/jest
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

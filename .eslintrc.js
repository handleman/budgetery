// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  overrides: [
    {
      // Playwright fixtures use a `use` callback param (`async ({ page }, use) =>`),
      // which is not a React Hook — the hook rule misfires here.
      files: ['e2e/**/*.ts'],
      rules: {
        'react-hooks/rules-of-hooks': 'off',
      },
    },
    {
      // jest.mock() factories run before imports are hoisted, so `require`
      // inside the factory is architecturally required, not a style choice.
      files: ['**/*.test.tsx', '**/__tests__/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
  ],
};

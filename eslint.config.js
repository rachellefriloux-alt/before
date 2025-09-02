module.exports = [
  {
    ignores: ['dist/*', 'node_modules/*', 'android/*', 'ios/*'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      // Basic rules for React Native/TypeScript
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
  },
];

module.exports = [
  {
    ignores: ['dist/*', 'node_modules/*', 'android/*', 'ios/*', '.metroignore', 'metroignore'],
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
  // Allow console usage in asset and script folders (flat config entry)
  {
    files: ['assets/**', 'onboarding-new/**', 'assets/scripts/**', 'scripts/**', 'onboarding-new/scripts/**'],
    rules: {
      'no-console': 'off'
    }
  },
];

module.exports = {
  root: true,
  extends: ['@react-native'],
  ignorePatterns: [
    'lib/',
    'coverage/',
    'example/android/',
    'example/ios/Pods/',
  ],
  rules: {
    'no-void': ['error', { allowAsStatement: true }],
    'react/react-in-jsx-scope': 'off',
  },
  overrides: [
    {
      files: ['jest.setup.js', '__tests__/**/*.{js,ts,tsx}'],
      env: {
        jest: true,
      },
    },
  ],
};

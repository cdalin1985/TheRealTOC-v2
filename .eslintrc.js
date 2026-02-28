module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native'],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    'react-native/react-native': true,
    jest: true,
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'off',
    'react-native/no-unused-styles': 'off',
    'react-native/split-platform-components': 'off',
    'react-native/no-raw-text': 'off',
    'react-native/sort-styles': 'off',
    'react-native/no-inline-styles': 'off',
    'react/no-unescaped-entities': 'off',
    '@typescript-eslint/no-require-imports': 'off',
  },
  overrides: [
    {
      files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-var': 'off',
      },
    },
  ],
};
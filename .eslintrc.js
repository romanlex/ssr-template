module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
    'plugin:jest/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  globals: {
    React: true,
    App: true,
    JSX: true,
  },
  plugins: ['@babel/eslint-plugin', 'prettier', 'import', 'formatjs'],
  rules: {
    'react/jsx-no-bind': [
      'error',
      {
        allowArrowFunctions: true,
        allowBind: false,
        ignoreRefs: true,
      },
    ],
    'react/no-did-update-set-state': 'error',
    'react/no-unknown-property': 'error',
    'react/no-unused-prop-types': 'error',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/react-in-jsx-scope': 'error',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-var-requires': 0,
    'prettier/prettier': 'error',
    'formatjs/no-offset': 'error',
    'formatjs/enforce-id': 'error',
    'no-console': ['warn'],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
    'import/no-unresolved': [2, { commonjs: true, amd: true, ignore: ['-APP_TARGET$'] }],
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      },
    ],
  },
  ignorePatterns: ['/**/node_modules/**', '**/build/**'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        paths: 'src/',
      },
      'babel-module': {
        root: 'src/',
        alias: {},
      },
    },
  },
}

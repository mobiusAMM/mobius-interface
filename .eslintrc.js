'use strict'


module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  ignorePatterns: ['*.js'],
  extends: ['@saberhq/eslint-config-react', 'plugin:jsx-a11y/recommended'],
  parserOptions: {
    project: 'tsconfig.json',
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'off',
  },
}

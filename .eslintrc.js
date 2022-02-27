'use strict'

// Required in Yarn 2 (PNP)
// https://github.com/yarnpkg/berry/issues/8#issuecomment-681069562
require('@rushstack/eslint-patch/modern-module-resolution')

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

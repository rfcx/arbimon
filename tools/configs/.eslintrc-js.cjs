module.exports = {
  extends: ['standard-with-typescript'],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 'latest',
    extraFileExtensions: ['.cjs', '.mjs', '.vue'],
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: ['simple-import-sort', 'unicorn', 'unused-imports'],
  rules: {
    // Disable rules
    // none

    // Add/override rules
    'import/newline-after-import': 'error',
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }], // only intentional logs (info/warn/error); disallow console.log
    'no-debugger': 'error',
    'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
    'no-restricted-imports': ['error', {
      paths: [
        {
          name: '.',
          message: 'Importing the current folder\'s index is likely to cause circular imports. Prefer a specific import such as `./types`, and only use the index to proxy exports.'
        }
      ]
    }],
    'no-void': ['error', { allowAsStatement: true }],
    'prefer-object-spread': 'error',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^(@(?!rfcx))?\\w'], // Dependencies
          ['^@rfcx'], // Our other modules
          ['^', '^\\.\\.', '^\\.'], // This module (unmatched, 2 dots, 1 dot)
          ['^\\u0000'] // Side-effects
        ]
      }
    ],
    'simple-import-sort/exports': 'error',
    'unused-imports/no-unused-imports-ts': 'error'
  }
}

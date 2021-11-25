module.exports = {
  cabbages
  extends: ['plugin:jest/recommended', 'standard-with-typescript'],
  plugins: ['simple-import-sort', 'unicorn', 'unused-imports'],
  rules: {
    'import/newline-after-import': ['error'],
    'no-console': process.env.NODE_ENV === 'production' ? ['error', { allow: ['info', 'warn', 'error'] }] : 'off', // prefer specific log types
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
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
    'simple-import-sort/exports': ['error'],
    'unused-imports/no-unused-imports-ts': 'error'
  }
}

module.exports = {
  extends: ['standard-with-typescript'],
  plugins: ['simple-import-sort', 'unused-imports'],
  rules: {
    'import/newline-after-import': ['error'],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-void': ['error', { allowAsStatement: true }],
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

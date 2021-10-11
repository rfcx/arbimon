module.exports = {
  extends: ['plugin:jest/recommended', 'standard-with-typescript'],
  plugins: ['simple-import-sort', 'unicorn', 'unused-imports'],
  rules: {
    'import/newline-after-import': ['error'],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 1 }],
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
    'unicorn/import-style': ['error',
      {
        styles: {
          'mapbox-gl': { named: true },
          dayjs: { named: true }
        }
      }
    ],
    'unused-imports/no-unused-imports-ts': 'error'
  }
}

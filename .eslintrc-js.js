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
        groups: [['^\\w'], ['^(@?\\w)'], ['^', '^\\.'], ['^\\u0000']]
      }
    ],
    'simple-import-sort/exports': ['error'],
    'unicorn/import-style': ['error',
      {
        styles: {
          'mapbox-gl': {
            named: true
          }
        }
      }
    ],
    'unused-imports/no-unused-imports-ts': 'error'
  }
}

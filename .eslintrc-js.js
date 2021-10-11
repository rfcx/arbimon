module.exports = {
  extends: ['standard-with-typescript'],
  plugins: ['simple-import-sort', 'unicorn', 'unused-imports'],
  rules: {
    'import/newline-after-import': ['error'],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-void': ['error', { allowAsStatement: true }],
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

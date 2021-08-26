module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true
  },
  plugins: [
    'simple-import-sort',
    'unused-imports'
  ],
  ignorePatterns: ['node_modules', '.*/**/*'],
  overrides: [
    {
      files: ['*.ts'],
      extends: '.eslintrc-ts.js'
    },
    {
      files: ['*.vue'],
      extends: '.eslintrc-vue.js'
    }
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
    'simple-import-sort/imports': [
      'error',
      {
        groups: [['^\\w'], ['^(@?\\w)'], ['^', '^\\.'], ['^\\u0000']]
      }
    ],
    'import/newline-after-import': ['error'],
    'unused-imports/no-unused-imports-ts': 'error',
    'simple-import-sort/exports': ['error'],
    'no-void': ['error', { allowAsStatement: true }]
  }
}
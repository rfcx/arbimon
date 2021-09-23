module.exports = {
  extends: ['.eslintrc-js.js'],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2021,
    extraFileExtensions: ['.vue'],
    parser: '@typescript-eslint/parser',
    project: ['./tsconfig.json'],
    sourceType: 'module',
    tsconfigRootDir: __dirname
  },
  rules: {
    '@typescript-eslint/strict-boolean-expressions': [
      'error',
      {
        allowString: true,
        allowNullableString: true,
        allowNullableObject: true
      }
    ],
    '@typescript-eslint/space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'always',
        asyncArrow: 'always'
      }
    ]
  }
}

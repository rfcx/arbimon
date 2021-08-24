module.exports = {
  extends: ['standard-with-typescript'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    project: [
      './tsconfig.json'
    ]
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    indent: 'off',
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    '@typescript-eslint/indent': ['error'],
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

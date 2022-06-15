module.exports = {
  env: { es2021: true, node: true },
  ignorePatterns: [
    'node_modules/',
    'build/',
    'dist/',
    'lib/',
    'cypress/',
    'coverage/',
    '!.*'
  ],
  root: true,
  overrides: [
    { extends: './.eslintrc-json.cjs', files: ['*.json'] },
    { extends: './.eslintrc-vue.cjs', files: ['*.vue'] },
    { extends: './.eslintrc-ts.cjs', files: ['*.{ts,tsx}'] },
    { extends: './.eslintrc-js.cjs', files: ['*.{js,jsx,cjs,mjs}'] }
  ]
}

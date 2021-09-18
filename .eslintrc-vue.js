module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/standard',
    '@vue/typescript/recommended',
    '.eslintrc-ts.js'
  ],
  rules: {
    '@typescript-eslint/no-empty-function': 'off',
    indent: 'off'
  }
}

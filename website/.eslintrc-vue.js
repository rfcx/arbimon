module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/standard',
    '@vue/typescript/recommended',
    '.eslintrc-ts.js'
  ],
  plugins: ['regex'],
  rules: {
    '@typescript-eslint/no-empty-function': 'off',
    indent: 'off',
    'regex/invalid': [
      'error', [
        {
          regex: '^  public',
          message: 'Accessibility modifiers are meaningless to vue-class-component',
          replacement: ''
        },
        {
          regex: '^  protected',
          message: 'Accessibility modifiers are meaningless to vue-class-component',
          replacement: ''
        },
        {
          regex: '^  private',
          message: 'Accessibility modifiers are meaningless to vue-class-component',
          replacement: ''
        }
      ]
    ]
  }
}

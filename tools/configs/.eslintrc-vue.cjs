const regexRules = require('./eslint-regex-rules.cjs')

module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/standard',
    '@vue/typescript/recommended',
    './.eslintrc-ts.cjs'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: {
      ts: '@typescript-eslint/parser',
      js: '@typescript-eslint/parser',
      '<template>': 'espree'
    }
  },
  plugins: ['regex'],
  rules: {
    // Override imported rules
    '@typescript-eslint/no-empty-function': 'off',
    indent: 'off',
    'vue/no-setup-props-destructure': 'off', // doesn't understand Reactivity Transform

    // Customize Rules
    'regex/invalid': [
      'error', [
        ...regexRules,
        {
          regex: ' public ',
          message: 'Accessibility modifiers are meaningless to vue-class-component',
          replacement: ' '
        },
        {
          regex: ' protected ',
          message: 'Accessibility modifiers are meaningless to vue-class-component',
          replacement: ' '
        },
        {
          regex: ' private ',
          message: 'Accessibility modifiers are meaningless to vue-class-component',
          replacement: ' '
        }
      ]
    ]
  }
}

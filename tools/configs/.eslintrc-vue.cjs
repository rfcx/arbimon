module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/standard',
    '@vue/typescript/recommended',
    './.eslintrc-ts.cjs'
  ],
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

    // Customize Rules
    'regex/invalid': [
      'error', [
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
        },
        // TODO ??? - Find a way to avoid repeating this
        {
          regex: 'from \'lodash\'',
          message: 'Use lodash-es',
          replacement: 'from \'lodash-es\''
        },
        {
          // eslint-disable-next-line no-useless-escape
          regex: 'import \\* as [a-zA-Z0-9]* from \'dayjs\'',
          message: 'Import the initialized dayjs object from \'@rfcx-bio/utils/dayjs-initialized\'',
          replacement: 'import { dayjs } from \'@rfcx-bio/utils/dayjs-initialized\''
        },
        {
          regex: '^import dayjs, ({[^}]*}) from \'dayjs\'$',
          message: 'Import the initialized dayjs object from \'@rfcx-bio/utils/dayjs-initialized\'',
          replacement: { function: 'return "import { dayjs } from \'@rfcx-bio/utils/dayjs-initialized\'; import " + captured[0] + " from \'dayjs\'"' }
        },
        {
          regex: 'new mapboxgl.Map\\(([^\\)]*)\\)',
          message: 'Use the createMap(...) function',
          replacement: { function: 'return "createMap(" + captured[0] + ")"' }
        },
        {
          regex: 'const sequalize',
          message: 'Spelling',
          replacement: 'const sequelize'
        }
      ]
    ]
  }
}

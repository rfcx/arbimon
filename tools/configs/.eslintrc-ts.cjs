module.exports = {
  extends: ['./.eslintrc-js.cjs'],
  plugins: ['sort-class-members'],
  rules: {
    // Override imported rules
    '@typescript-eslint/indent': 'off', // This rule is totally broken: https://github.com/typescript-eslint/typescript-eslint/issues/1824
    '@typescript-eslint/space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'always',
        asyncArrow: 'always'
      }
    ],
    '@typescript-eslint/strict-boolean-expressions': [
      'error',
      {
        allowString: true,
        allowNullableString: true,
        allowNullableObject: true
      }
    ],

    // Customize rules
    'regex/invalid': [
      'error', [
        // TODO ??? - Extract this as an ESLint rule: `import-initialized-library`
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
          regex: 'sequalize',
          message: 'Spelling',
          replacement: 'sequelize'
        }
      ]
    ],
    'sort-class-members/sort-class-members': [
      'error',
      {
        order: [
          '[static-properties]',
          '[static-methods]',
          '[injects]',
          '[provides]',
          '[props]',
          '[emits]',
          '[properties]',
          '[getters]',
          '[setters]',
          'constructor',
          '[vue-before-create]',
          '[vue-created]',
          '[vue-before-mount]',
          '[vue-mounted]',
          '[vue-before-update]',
          '[vue-updated]',
          '[vue-before-unmount]',
          '[vue-unmounted]',
          '[vue-error-captured]',
          '[vue-render-tracked]',
          '[vue-render-triggered]',
          '[vue-activated]',
          '[watches]',
          '[methods]'
        ],
        groups: {
          injects: [{ groupByDecorator: 'Inject', type: 'property' }],
          provides: [{ groupByDecorator: 'Provide', type: 'property' }],
          props: [{ groupByDecorator: 'Prop', type: 'property' }],
          emits: [{ name: '/emit.+/', type: 'method' }],
          getters: [{ type: 'method', kind: 'get' }],
          setters: [{ type: 'method', kind: 'set' }],
          watches: [{ name: '/on.+/', type: 'method' }],
          'vue-before-create': [{ name: 'beforeCreate', type: 'method' }],
          'vue-created': [{ name: 'created', type: 'method' }],
          'vue-before-mount': [{ name: 'beforeMount', type: 'method' }],
          'vue-mounted': [{ name: 'mounted', type: 'method' }],
          'vue-before-update': [{ name: 'beforeUpdate', type: 'method' }],
          'vue-updated': [{ name: 'updated', type: 'method' }],
          'vue-activated': [{ name: 'activated', type: 'method' }],
          'vue-deactivated': [{ name: 'deactivated', type: 'method' }],
          'vue-before-unmount': [{ name: 'beforeUnmount', type: 'method' }],
          'vue-unmounted': [{ name: 'unmounted', type: 'method' }],
          'vue-error-captured': [{ name: 'errorCaptured', type: 'method' }],
          'vue-render-tracked': [{ name: 'renderTracked', type: 'method' }],
          'vue-render-triggered': [{ name: 'renderTriggered', type: 'method' }]
        },
        accessorPairPositioning: 'getThenSet'
      }
    ]
  }
}

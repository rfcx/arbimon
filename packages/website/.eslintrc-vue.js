module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/standard',
    '@vue/typescript/recommended',
    '.eslintrc-ts.js'
  ],
  plugins: ['regex'],
  rules: {
    // Overrides
    '@typescript-eslint/no-empty-function': 'off',
    indent: 'off',
    'vue/multi-word-component-names': 'warn',

    // Rules
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
          regex: '^import dayjs from \'dayjs\'$',
          message: 'Import the initialized dayjs object from \'~/dayjs\'',
          replacement: 'import { dayjs } from \'~/dayjs\''
        },
        {
          regex: '^import dayjs, ({[^}]*}) from \'dayjs\'$',
          message: 'Import the initialized dayjs object from \'~/dayjs\'',
          replacement: { function: 'return "import { dayjs } from \'~/dayjs\'; import " + captured[0] + " from \'dayjs\'"' }
        },
        {
          regex: '^import mapboxgl from \'mapbox-gl\'$',
          message: 'Import the initialized mapboxgl object from \'~/maps\'',
          replacement: 'import { mapboxgl } from \'~/maps\''
        },
        {
          regex: '^import mapboxgl, ({[^}]*}) from \'mapbox-gl\'$',
          message: 'Import the initialized mapboxgl object from \'~/maps\'',
          replacement: { function: 'return "import { mapboxgl } from \'~/maps\'; import " + captured[0] + " from \'mapbox-gl\'"' }
        }
      ]
    ]
  }
}

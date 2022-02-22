module.exports = [
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

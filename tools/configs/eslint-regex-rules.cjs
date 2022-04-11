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
    regex: 'from \'sequelize/dist\'',
    message: 'Did you mean to import from root \'sequelize\'?',
    replacement: 'from \'sequelize\''
  },
  {
    regex: 'from \'path/posix\'',
    message: 'Did you mean to import from OS-neutral \'path\'?',
    replacement: 'from \'path\''
  },
  {
    regex: 'from \'path/win32\'',
    message: 'Did you mean to import from OS-neutral \'path\'?',
    replacement: 'from \'path\''
  },
  // Spelling helpers
  {
    regex: 'sequalize',
    message: 'Spelling',
    replacement: 'sequelize'
  }
]

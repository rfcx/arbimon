import tsJestUtils from 'ts-jest/utils/index.js'

export const createConfig = (tsconfig) => ({
  rootDir: 'src',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': { useESM: true }
  },
  moduleFileExtensions: [
    'js',
    'ts',
    'json',
    'vue'
  ],
  moduleNameMapper: {
    ...(tsconfig.compilerOptions.paths
      ? tsJestUtils.pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/' })
      : {}
    ),
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.ts$': 'ts-jest'
  }
})

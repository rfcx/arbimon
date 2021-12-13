import tsJest from 'ts-jest'

export const createConfig = (tsconfig) => ({
  rootDir: 'src',
  extensionsToTreatAsEsm: ['.ts'],
  globals: { 'ts-jest': { useESM: true } },
  moduleFileExtensions: ['js', 'ts', 'json', 'vue'],
  moduleNameMapper: {
    ...(tsconfig.compilerOptions.paths
      ? tsJest.pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/' })
      : {}
    ),
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.vue$': 'vue3-jest',
    '^.+\\.ts$': 'ts-jest'
  }
})

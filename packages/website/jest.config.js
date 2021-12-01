import tsJestUtils from 'ts-jest/utils/index.js'

// pathsToModuleNameMapper doesn't follow `extends` to parent configs
// => we need a direct ref to the config with `paths` defined
import tsconfig from './tsconfig.build.json'

export default {
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
  moduleNameMapper: tsJestUtils.pathsToModuleNameMapper(
    tsconfig.compilerOptions.paths,
    { prefix: '<rootDir>/' }
  ),
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '^.+\\.ts$': 'ts-jest'
  }
}

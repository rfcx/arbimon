import tsjestUtils from 'ts-jest/utils/index.js'

// pathsToModuleNameMapper doesn't follow `extends` to parent configs
// => we need a direct ref to the config with `paths` defined
import tsconfig from './tsconfig.build.json'

export default {
  moduleFileExtensions: [
    'js',
    'ts',
    'json'
  ],
  moduleNameMapper: tsjestUtils.pathsToModuleNameMapper(
    tsconfig.compilerOptions.paths,
    { prefix: '<rootDir>/' + tsconfig.compilerOptions.baseUrl }
  ),
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
}

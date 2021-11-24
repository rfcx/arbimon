const { pathsToModuleNameMapper } = require('ts-jest/utils')

// pathsToModuleNameMapper doesn't follow `extends` to parent configs
// => we need a direct ref to the config with `paths` defined
const { compilerOptions } = require('./tsconfig.build.json')

module.exports = {
  rootDir: 'src',
  moduleFileExtensions: [
    'js',
    'ts',
    'json',
    'vue'
  ],
  moduleNameMapper: pathsToModuleNameMapper(
    compilerOptions.paths,
    { prefix: '<rootDir>/' }
  ),
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.vue$': 'vue-jest'
  }
}

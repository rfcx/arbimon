export default {
  rootDir: 'src',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': { useESM: true }
  },
  moduleFileExtensions: [
    'js',
    'ts',
    'json'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  }
}

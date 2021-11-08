module.exports = {
  extends: ['stylelint-config-recommended-scss'],
  ignoreFiles: ['node_modules', 'build', 'dist', 'lib', '.*/**/*', 'cypress', 'coverage'],
  rules: {
    'color-no-hex': null
  }
}

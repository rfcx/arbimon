module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: ['.eslintrc-js.js'],
  ignorePatterns: ['!.*.js', 'node_modules', 'dist', 'build', '.*/**/*', 'cypress'],
  overrides: [
    {
      files: ['src/_components/**/*.ts', '*.vue'],
      extends: '.eslintrc-vue.js'
    },
    { files: ['*.ts'], extends: '.eslintrc-ts.js' }
  ],
  root: true
}

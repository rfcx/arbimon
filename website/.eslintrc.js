module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: ['.eslintrc-js.js'],
  ignorePatterns: ['!.*.js', 'node_modules', 'dist', 'build', '.*/**/*'],
  overrides: [
    {
      files: ['src/components/**/*.ts', 'src/pages/**/*.ts', '*.vue'],
      extends: '.eslintrc-vue.js'
    },
    { files: ['*.ts'], extends: '.eslintrc-ts.js' }
  ],
  root: true
}

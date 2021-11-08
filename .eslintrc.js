module.exports = {
  extends: ['.eslintrc-js.js'],
  env: {
    es2021: true,
    node: true
  },
  ignorePatterns: ['!.*.js', 'node_modules', 'dist', 'build', 'lib', '.*/**/*', 'cypress', 'coverage'],
  overrides: [
    {
      files: ['src/_components/**/*.ts', '*.vue'],
      extends: '.eslintrc-vue.js',
      parserOptions: { project: ['./tsconfig.json'] }
    },
    {
      files: ['*.ts'],
      extends: '.eslintrc-ts.js',
      parserOptions: { project: ['./tsconfig.json'] }
    }
  ],
  root: true
}

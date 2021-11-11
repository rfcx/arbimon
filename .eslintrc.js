module.exports = {
  extends: '.eslintrc-js.js',
  ignorePatterns: ['!.*.js', '!.*.ts', '**/node_modules', '**/dist', '**/build', '**/lib', '**/cypress', '**/coverage'],
  env: { es2021: true, node: true },
  root: true,
  overrides: [
    { extends: '.eslintrc-vue.js', files: ['*.vue', 'packages/website/src/_components/**/*.ts'] },
    { extends: '.eslintrc-ts.js', files: ['*.ts', '.*.ts'] },
    { extends: '.eslintrc-js.js', files: ['*.js', '.*.js'] }
  ]
}

module.exports = {
  ignorePatterns: ['**/node_modules', '**/dist', '**/build', '**/lib', '**/cypress', '**/coverage'],
  env: { es2021: true, node: true },
  root: true,
  overrides: [
    {
      extends: ['../../.eslintrc-js.js'],
      files: ['*.js']
    },
    {
      extends: '../../.eslintrc-vue.js',
      files: ['src/_components/**/*.ts', '*.vue'],
      parserOptions: { project: ['./tsconfig.json', 'packages/*/tsconfig.json'] }
    },
    {
      extends: '../../.eslintrc-ts.js',
      files: ['*.ts'],
      parserOptions: { project: ['./tsconfig.json', 'packages/*/tsconfig.json'] }
    }
  ]
}

module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: ['standard-with-typescript'],
  ignorePatterns: ['!.*.js', 'node_modules', 'dist', 'build', '.*/**/*'],
  overrides: [
    {
      files: ['*.ts'],
      extends: ['plugin:cypress/recommended', 'standard-with-typescript'],
      parserOptions: {
        ecmaVersion: 2021,
        parser: '@typescript-eslint/parser',
        project: ['./tsconfig.json']
      }
    }
  ],
  root: true
}

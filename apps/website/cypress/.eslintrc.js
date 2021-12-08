module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: ['plugin:cypress/recommended'],
  ignorePatterns: ['!.*.js', 'node_modules', 'build', 'dist', 'lib', '.*/**/*'],
  rules: { 'cypress/no-unnecessary-waiting': 'off' },
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

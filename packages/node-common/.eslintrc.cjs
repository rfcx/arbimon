module.exports = {
  extends: ['../../tools/configs/.eslintrc-base.cjs'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname
  }
}

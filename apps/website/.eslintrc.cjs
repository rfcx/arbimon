module.exports = {
  extends: ['../../tools/configs/.eslintrc-base.cjs'],
  parserOptions: {
    project: ['../../packages/*/tsconfig.json', '../../apps/*/tsconfig.json'],
    tsconfigRootDir: __dirname
  }
}

module.exports = {
  extends: ['../../tools/configs/.eslintrc-base.cjs'],
  // twin-diff.mjs is a standalone mysql2pg dry-run comparison harness (run
  // manually with node, prints to stdout by design) — not app code
  ignorePatterns: ['twin-diff.mjs'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname
  }
}

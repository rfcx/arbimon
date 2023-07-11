// Note: ignoreFiles is much less efficient than `.stylelintignore`
module.exports = {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-property-sort-order-smacss'
  ],
  rules: {
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['extends', 'tailwind', 'screen', 'apply', 'use']
      }
    ],
    'at-rule-empty-line-before': ['always', {
      except: ['blockless-after-same-name-blockless', 'blockless-after-blockless', 'inside-block'],
      ignore: ['after-comment', 'first-nested']
    }]
  }
}

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
        ignoreAtRules: ['extends', 'tailwind', 'screen']
      }
    ],
    'at-rule-empty-line-before': ['always', {
      except: ['after-same-name']
    }],
    'rule-empty-line-before': ['always', {
      except: ['after-same-name']
    }]
  }
}

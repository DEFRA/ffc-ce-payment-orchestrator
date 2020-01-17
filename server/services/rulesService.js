const rules = require('../../data/rules.json')

module.exports = {
  get: async function () {
    return rules
  },
  updateRuleEnabled: async function (ruleID, enabled) {
    const ruleIndex = rules.findIndex(rule => rule.id === ruleID)

    if (ruleIndex > -1) {
      rules[ruleIndex].enabled = enabled
      return rules[ruleIndex]
    }

    return {}
  }
}

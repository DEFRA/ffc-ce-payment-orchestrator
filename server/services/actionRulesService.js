const rulesService = require('./rulesService')

module.exports = {
  update: async function (actionID, ruleID, enabled) {
    // Throwing away the actionID at the moment as we assume only one action exists.
    return rulesService.updateRuleEnabled(ruleID, enabled)
  }
}

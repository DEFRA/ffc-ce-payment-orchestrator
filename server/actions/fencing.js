const config = require('../config')
const rulesEngine = require('../rules-engine')
const actionsService = require('../services/actionsService')

const id = 'FG1'

module.exports = {
  calculateValue: function (landParcel, options) {
    return options.quantity * config.actions.fencingPricePerMetre
  },

  isEligible: async function (landParcel, options) {
    const { rules } = await actionsService.getByIdWithRules(id)
    let rulesPassed = false
    const rulesPass = () => {
      rulesPassed = true
    }
    await rulesEngine.doFullRun(rules, [landParcel], { requestedLength: options.quantity }, rulesPass)
    return rulesPassed
  }
}

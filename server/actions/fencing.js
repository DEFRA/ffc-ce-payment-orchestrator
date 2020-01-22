const config = require('../config')
const rulesEngine = require('../rules-engine')

module.exports = {
  calculateValue: function (landParcel, options) {
    return options.quantity * config.actions.fencingPricePerMetre
  },

  isEligible: async function (landParcel, options) {
    let rulesPassed = false
    const rulesPass = () => {
      rulesPassed = true
    }
    await rulesEngine.doFullRun({}, landParcel, { requestedLength: options.quantity }, rulesPass)
    return rulesPassed
  }
}

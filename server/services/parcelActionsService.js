const actionsService = require('./actionsService')
const parcelService = require('./parcelService')
const rulesEngine = require('../rules-engine')

module.exports = {
  get: async function (parcelRef) {
    const actions = actionsService.get()
    const returnActions = []
    const parcelData = parcelService.getByRef(parcelRef)
    // Mock rules engine function
    rulesEngine.doEligibilityRun = rulesEngine.doFullRun
    // End of mock
    for (const action of actions) {
      rulesEngine.resetEngine()
      let actionPassed = false
      const successFunc = function () {
        actionPassed = true
      }
      // Mock rules engine function
      const rulesToUse = rulesEngine.enabledEligibilityRules(action.rules)
      //
      await rulesEngine.doEligibilityRun(rulesToUse, [parcelData], { }, successFunc)
      if (actionPassed) {
        delete action.rules
        returnActions.push(action)
      }
    }
    return returnActions
  }
}

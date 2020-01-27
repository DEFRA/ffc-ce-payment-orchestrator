const actionsService = require('./actionsService')
const parcelService = require('./parcelService')
const rulesEngine = require('../rules-engine')

module.exports = {
  get: async function (parcelRef) {
    const actions = actionsService.get()
    const returnActions = []
    const parcelData = parcelService.getByRef(parcelRef)
    for (const action of actions) {
      rulesEngine.resetEngine()
      let actionPassed = false
      const successFunc = function () {
        actionPassed = true
      }
      await rulesEngine.doEligibilityRun(action.rules, [parcelData], { }, successFunc)
      if (actionPassed) {
        delete action.rules
        returnActions.push(action)
      }
    }
    return returnActions
  }
}

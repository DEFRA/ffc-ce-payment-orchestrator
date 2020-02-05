const actionsService = require('./actionsService')
const parcelService = require('./parcelService')
const rulesEngine = require('./rulesEngineService')

module.exports = {
  get: async function (parcelRef) {
    const actions = await actionsService.get()
    const returnActions = []
    const parcelData = parcelService.getByRef(parcelRef)

    for (const action of actions) {
      let actionPassed = false
      const successFunc = function () {
        actionPassed = true
      }
      await rulesEngine.doEligibilityRun(action.rules, [parcelData], { }, successFunc)

      if (actionPassed) {
        const { rules, ...returnAction } = action
        returnActions.push(returnAction)
      }
    }
    return returnActions
  }
}

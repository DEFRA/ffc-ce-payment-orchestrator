const actionsService = require('./actionsService')
const parcelService = require('./parcelService')
const rulesEngine = require('./rulesEngineService')
const { reasons } = require('../rules-engine/eligibilityRuleFailureReasons')

function buildReturnAction (action, eligible, failingEligibilityRules) {
  const returnAction = {
    id: action.id,
    description: action.description,
    eligible
  }
  if (!eligible) {
    returnAction.reason = failingEligibilityRules.map(fr => reasons[fr]).join(', ')
  }
  return returnAction
}

module.exports = {
  get: async function (parcelRef) {
    const actions = await actionsService.get()
    const returnActions = []
    const parcelData = parcelService.getByRef(parcelRef)

    for (const action of actions) {
      rulesEngine.resetEngine()
      let actionPassed = false
      const successFunc = function (args) {
        actionPassed = true
      }

      const runResult = await rulesEngine.doEligibilityRun(action.rules, [parcelData], { }, successFunc)
      const { failingRules } = runResult

      returnActions.push(buildReturnAction(action, actionPassed, failingRules))
    }
    return returnActions
  }
}

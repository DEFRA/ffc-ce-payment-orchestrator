const actionsService = require('./actionsService')
const parcelService = require('./parcelService')
const rulesEngineHelper = require('../rules-engine/helper')
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
      const runResult = await rulesEngineHelper.eligibilityRun(action, parcelData, {})
      const { actionPassed, failingRules } = runResult
      returnActions.push(buildReturnAction(action, actionPassed, failingRules))
    }
    return returnActions
  }
}

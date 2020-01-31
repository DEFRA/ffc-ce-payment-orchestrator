const rulesEngine = require('./index')
const { quantityFactName, rateFactName } = require('./enums')

function eligibiltyRun (action, parcel, options) {
  const eligibilityAction = {
    ...action,
    rules: action.rules.filter(r => r.type === 'eligibility')
  }
  return fullRun(eligibilityAction, parcel, options)
}

async function fullRun (action, parcel, options) {
  const runResult = { eligible: false }
  rulesEngine.resetEngine()
  const successCallback = (event, almanac, ruleResult) => {
    runResult.eligible = true
    runResult.value = action[rateFactName] * options[quantityFactName]
    runResult.upperbound = almanac.factMap.get('upperbound')
  }
  await rulesEngine.doFullRun(action.rules, [parcel], options, successCallback)
  return runResult
}

module.exports = {
  eligibiltyRun,
  fullRun
}

const rulesEngine = require('../services/rulesEngineService')

async function fullRun (action, parcel, options) {
  const runResult = { eligible: false }
  rulesEngine.resetEngine()
  const successCallback = ({ facts, isEligible }) => {
    runResult.eligible = isEligible
    runResult.facts = facts
    runResult.value = action.rate * options.quantity
  }
  await rulesEngine.doFullRun(action.rules, [parcel], options, successCallback)
  return runResult
}

module.exports = {
  fullRun
}

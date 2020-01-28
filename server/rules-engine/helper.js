const rulesEngine = require('./index')
const { quantityFactName, rateFactName } = require('./enums')

async function fullRun (action, parcel, options) {
  const runResult = { eligible: false }
  rulesEngine.resetEngine()
  const successCallback = () => {
    runResult.eligible = true
    runResult.value = action[rateFactName] * options[quantityFactName]
  }
  await rulesEngine.doFullRun(action.rules, [parcel], options, successCallback)
  return runResult
}

module.exports = {
  fullRun
}
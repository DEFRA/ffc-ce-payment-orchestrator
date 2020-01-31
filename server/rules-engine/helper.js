const rulesEngine = require('../services/rulesEngineService')

function eligibiltyRun (action, parcel, options) {
  const eligibilityAction = {
    ...action,
    rules: action.rules.filter(r => r.type === 'eligibility')
  }
  return fullRun(eligibilityAction, parcel, options)
}

async function fullRun (action, parcel, options) {
  const upperboundFactsByActionId = {
    FG1: 'adjustedPerimeter',
    SW6: 'pondlessArea'
  }
  const upperboundFact = upperboundFactsByActionId[action.id]
  const returnFacts = []

  if (upperboundFact) {
    returnFacts.push(upperboundFact)
  }

  const runResult = { eligible: false }
  const successCallback = ({ facts, isEligible }) => {
    runResult.eligible = isEligible
    runResult.facts = facts
    runResult.value = action.rate * options.quantity

    if (upperboundFact) {
      runResult.upperbound = facts[upperboundFact]
    }
  }

  rulesEngine.resetEngine()
  await rulesEngine.doFullRun(action.rules, [parcel], options, successCallback, returnFacts)

  return runResult
}

module.exports = {
  eligibiltyRun,
  fullRun
}

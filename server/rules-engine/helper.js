const rulesEngine = require('../services/rulesEngineService')

async function fullRun (action, parcel, options) {
  const runResult = {
    eligible: false
  }

  const successCallback = ({ facts, isEligible }) => {
    runResult.eligible = isEligible
    runResult.facts = facts
    runResult.value = action.rate * options.quantity
  }

  rulesEngine.resetEngine()
  await rulesEngine.doFullRun(action.rules, [parcel], options, successCallback, [])

  return runResult
}

async function preCheckRun (action, parcel, options) {
  const allActionData = {
    FG1: {
      quantityRuleID: 1,
      removeFeaturesRuleID: 2,
      upperboundFact: 'adjustedPerimeter',
      defaultUpperbound: 'totalPerimeter'
    },
    SW6: {
      quantityRuleID: 7,
      removeFeaturesRuleID: 6,
      upperboundFact: 'pondlessArea',
      defaultUpperbound: 'totalArea'
    }
  }

  const preCheckResult = {}
  const actionData = allActionData[action.id]

  const preCheckRules = action.rules.filter((rule) => {
    return (rule.type === 'prevalidation') && rule.enabled
  })

  if (preCheckRules.find((rule) => rule.id === actionData.quantityRuleID)) {
    preCheckResult.upperbound = parcel[actionData.defaultUpperbound]
  }

  // Rule precedence: the rule that removes features from the total overrides
  // the default quantity rule if both are enabled
  if (preCheckRules.find((rule) => rule.id === actionData.removeFeaturesRuleID)) {
    // Get the rules engine to calculate the upper bound
    const returnFacts = [actionData.upperboundFact]
    const successCallback = ({ facts, isEligible }) => {
      preCheckResult.upperbound = facts[actionData.upperboundFact]
    }
    rulesEngine.resetEngine()
    await rulesEngine.doFullRun(action.rules, [parcel], options, successCallback, returnFacts)
  }

  return preCheckResult
}

module.exports = {
  fullRun,
  preCheckRun
}

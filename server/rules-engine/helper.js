const rulesEngine = require('../services/rulesEngineService')

const actionRuleData = {
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
  },
  LV7: {
    // LV7 has different eligibility criteria as only one rule needs to be true
    // so we override the default eligbility check with this function
    eligibilityCheckOverride: (result, enabledRules) => {
      const ruleNames = enabledRules.map((rule) => rule.event.type)
      const passedRuleNames = result.events.map((event) => event.type)
      return ruleNames.some((rule) => passedRuleNames.includes(rule))
    }
  }
}

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
  await rulesEngine.doFullRun(action.rules, [parcel], options, successCallback, [], actionRuleData[action.id].eligibilityCheckOverride)

  return runResult
}

async function eligibilityRun (action, parcel, options) {
  let actionPassed = false
  const successFunc = function (args) {
    actionPassed = true
  }

  rulesEngine.resetEngine()
  const results = await rulesEngine.doEligibilityRun(action.rules, [parcel], options, successFunc, actionRuleData[action.id].eligibilityCheckOverride)

  return { actionPassed, ...results }
}

async function preCheckRun (action, parcel, options) {
  const preCheckResult = {}
  const actionData = actionRuleData[action.id]

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
  preCheckRun,
  eligibilityRun
}

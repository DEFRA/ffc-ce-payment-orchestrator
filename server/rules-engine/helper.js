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
    // so we override the default eligibility check with this function
    // Logic is also a bit odd: if there are no eligibility rules enabled then
    // we assume you are eligible, otherwise either of one of the two eligibilty rules
    // must pass if enabled. It's not ideal but works for this limited use case.
    eligibilityCheckOverride: (result, enabledRules) => {
      const ruleNames = enabledRules.map((rule) => rule.event.type)
      const passedRuleNames = result.events.map((event) => event.type)
      return ruleNames.length > 0 ? ruleNames.some((rule) => passedRuleNames.includes(rule)) : true
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

async function preCheckRun (action, options) {
  const preCheckRules = action.rules.filter((rule) => {
    return (rule.type === 'prevalidation') && rule.enabled
  })

  console.log({ rules: action.rules, options })
  const failedRules = await rulesEngine.runRules(preCheckRules, options)
  const inputBounds = failedRules
    .map(r => r.inputBounds)
    .filter(ib => ib !== {})

  if (inputBounds.length > 1) {
    throw new Error('There should be zero or one rule which has input bounds')
  }

  return inputBounds[0] ? inputBounds[0] : {}
}

module.exports = {
  fullRun,
  preCheckRun,
  eligibilityRun
}

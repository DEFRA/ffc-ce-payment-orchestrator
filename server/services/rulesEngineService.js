const { runRules, runEngine, rules } = require('@neilbmclaughlin/rules-engine-test')

const rulesMap = {
  1: rules.perimeter,
  2: rules.adjustedPerimeter,
  3: rules.tolerancePerimeter,
  4: rules.noActionsInTimePeriod,
  5: rules.notSSSI,
  6: rules.pondlessArea,
  7: rules.area,
  8: rules.cultivatedParcel,
  9: rules.inWaterPollutionZone,
  10: rules.hasReintroducedGrazing
}

module.exports = {
  doEligibilityRun: function (rules, parcels, passedFacts, successFunc, eligibilityRuleFunc) {
    const eligibilityRules = rules.filter(rule => rule.type === 'eligibility')
    return this.doFullRun(eligibilityRules, parcels, passedFacts, successFunc, [], eligibilityRuleFunc)
  },

  doFullRun: async function (requestedRules, parcels, passedFacts, successFunc, returnFacts, eligibilityRuleFunc) {
    try {
      if (parcels.length !== 1) {
        throw Error('rulesEngineService.doFullRun requires exactly 1 parcel')
      }

      const [parcel] = parcels

      const enabledRules = requestedRules
        .filter(rule => rule.enabled)
        .map(rule => rulesMap[rule.id])

      const parameters = {
        actionId: passedFacts.actionId || 'FG1',
        actionYearsThreshold: 5
      }

      if (passedFacts.quantity) {
        parameters.quantity = passedFacts.quantity
      }

      const result = await runEngine(enabledRules, { parcel, ...parameters }, returnFacts)
      const { events, facts } = result
      const rulesRun = events.map(e => e.type)

      const isEligible = eligibilityRuleFunc
        ? eligibilityRuleFunc(result, enabledRules)
        : events.length === enabledRules.length

      if (isEligible) {
        successFunc({ facts, isEligible })
      }

      return {
        runResult: result,
        passingRules: enabledRules.map(er => er.event.type).filter(r => rulesRun.includes(r)),
        failingRules: enabledRules.map(er => er.event.type).filter(r => !rulesRun.includes(r))
      }
    } catch (error) {
      console.error('rules engine failed', error)
    }
  },

  runRules: function (requestedRules, options) {
    const rules = requestedRules.map(rule => rulesMap[rule.id])
    return runRules(rules, options)
  },

  resetEngine: function () {

  }
}

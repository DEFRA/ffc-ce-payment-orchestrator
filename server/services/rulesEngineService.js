const { runEngine, rules } = require('@neilbmclaughlin/rules-engine-test')

const rulesMap = {
  1: rules.perimeter,
  2: rules.adjustedPerimeter,
  3: rules.tolerancePerimeter,
  4: rules.noActionsInTimePeriod,
  5: rules.notSSSI,
  6: rules.pondlessArea,
  7: rules.area
}

module.exports = {
  doEligibilityRun: async function (rules, parcels, passedFacts, successFunc) {
    const eligibilityRules = rules.filter(rule => rule.type === 'eligibility')
    await this.doFullRun(eligibilityRules, parcels, passedFacts, successFunc)
  },

  doFullRun: async function (requestedRules, parcels, passedFacts, successFunc, returnFacts) {
    try {
      if (parcels.length !== 1) {
        throw Error('rulesEngineService.doFullRun requires exactly 1 parcel')
      }

      const parcel = parcels[0]

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

      const result = await runEngine(enabledRules, { parcel, ...parameters }, undefined, returnFacts)
      const { events, facts } = result
      const isEligible = events.length === enabledRules.length

      if (isEligible) {
        successFunc({ facts, isEligible })
      }
    } catch (error) {
      console.error('rules engine failed', error)
    }
  },

  resetEngine: function () {

  }
}

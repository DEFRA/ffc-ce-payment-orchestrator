const { runEngine, rules: engineRules } = require('@neilbmclaughlin/rules-engine-test')
const rules = require('../../data/rules.json')

const rulesMap = rules.reduce((acc, curr) => {
  acc[curr.id] = curr
  curr.engineRule = engineRules[curr.engineRule]
  return acc
}, {})

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

      const [parcel] = parcels

      const enabledRules = requestedRules
        .filter(rule => rule.enabled)
        .map(rule => rulesMap[rule.id].engineRule)

      const parameters = {
        actionId: passedFacts.actionId || 'FG1',
        actionYearsThreshold: 5
      }

      if (passedFacts.quantity) {
        parameters.quantity = passedFacts.quantity
      }

      const result = await runEngine(enabledRules, { parcel, ...parameters }, returnFacts)
      const { events, facts } = result
      const isEligible = events.length === enabledRules.length

      if (isEligible) {
        successFunc({ facts, isEligible })
      }
    } catch (error) {
      console.error('rules engine failed', error)
    }
  }
}

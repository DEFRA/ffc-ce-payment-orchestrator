const { allRulesPass, rules } = require('@neilbmclaughlin/rules-engine-test')

const rulesMap = {
  1: rules.perimeter,
  2: rules.adjustedPerimeter,
  3: rules.tolerancePerimeter,
  4: rules.noActionsInTimePeriod,
  5: rules.notSSSI
}

module.exports = {
  doEligibilityRun: async function (rules, parcels, passedFacts, successFunc) {
    const eligibilityRules = rules.filter(rule => rule.type === 'eligibility')
    await this.doFullRun(eligibilityRules, parcels, passedFacts, successFunc)
  },

  doFullRun: async function (requestedRules, parcels, passedFacts, successFunc) {
    try {
      if (parcels.length !== 1) {
        throw Error('rulesEngineService.doFullRun requires exactly 1 parcel')
      }

      const rawParcel = parcels[0]
      const parcel = {
        parcelRef: rawParcel.ref,
        perimeter: rawParcel.totalPerimeter,
        perimeterFeatures: rawParcel.perimeterFeatures.map(({ length, type }) => ({
          perimeter: length,
          type
        })),
        previousActions: rawParcel.previousActions,
        sssi: rawParcel.SSSI || false
      }

      const enabledRules = requestedRules
        .filter(rule => rule.enabled)
        .map(rule => rulesMap[rule.id])

      const parameters = {
        actionId: passedFacts.actionId || 'FG1',
        actionYearsThreshold: 5
      }

      if (passedFacts.quantity) {
        parameters.claimedPerimeter = passedFacts.quantity
      }

      const isEligible = await allRulesPass(enabledRules, { parcel, ...parameters })

      if (isEligible) {
        successFunc()
      }
    } catch (error) {
      console.error('rules engine failed', { error })
    }
  },

  resetEngine: function () {

  }
}

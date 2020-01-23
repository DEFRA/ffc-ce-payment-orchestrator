describe('Rules engine SSSI rule test', () => {
  const rulesEngine = require('../../server/rules-engine')
  const parcelsTestData = require('./test-data/parcels-sssi.json')
  const testRules = require('./test-data/rules-sssi.json')
  const successEvent = jest.fn()
  const eventType = 'sssi'
  const sssiParcelRef = 'SD78379604'

  beforeEach(() => {
    rulesEngine.resetEngine()
  })

  test('sssi rule discards parcel with sssi', async () => {
    const enabledRules = rulesEngine.enabledEligibilityRules(testRules)
    const conditions = rulesEngine.conditionsFromRules(enabledRules)
    rulesEngine.setupStandardRule(conditions, 'SSSI', eventType)
    rulesEngine.engine.on('success', async (event, almanac, ruleResult) => {
      if (event.type === eventType) {
        successEvent()
      }
    })
    var actions = parcelsTestData.map(parcel => {
      return rulesEngine.runEngine(parcel)
    })
    await Promise.all(actions)
    expect(successEvent).toHaveBeenCalledTimes(1)
  })

  test('eligibility rules run gets parcels without sssi', async () => {
    const acceptedParcels = []
    const enabledRules = rulesEngine.enabledEligibilityRules(testRules)
    const conditions = rulesEngine.conditionsFromRules(enabledRules)
    rulesEngine.setupStandardRule(conditions, 'SSSI', eventType)
    rulesEngine.setupAcceptedItemsRule(async function (event, almanac, ruleResult) {
      acceptedParcels.push(await almanac.factValue('ref'))
      successEvent()
    })
    var actions = parcelsTestData.map(parcel => {
      return rulesEngine.runEngine(parcel)
    })
    await Promise.all(actions)

    expect(acceptedParcels.includes(sssiParcelRef)).toBe(false)
    expect(acceptedParcels.length).toBe(4)
    expect(successEvent).toHaveBeenCalledTimes(4)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})

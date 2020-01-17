describe('Rules engine rule test', () => {
  let rulesEngine
  let SSSIrule
  const parcelsTestData = require('./test-data/parcels-sssi.json')
  const testRules = require('./test-data/rules-sssi.json')
  const successEvent = jest.fn()
  const eventType = 'sssi'

  beforeAll(async () => {
    rulesEngine = require('../../server/rules-engine')
  })

  beforeEach(async () => {
  })

  test('sssi rule discards parcel with sssi', async () => {
    rulesEngine.engine.on('success', async (event, almanac, ruleResult) => {
      if (event.type === eventType) {
        almanac.addRuntimeFact(rulesEngine.enums.ruleRejected, true)
        successEvent()
      }
    })
    const enabledRules = rulesEngine.enabledEligibilityRules(testRules)
    const conditions = rulesEngine.conditionsFromRules(enabledRules)
    SSSIrule = rulesEngine.buildStandardRule(conditions, 'SSSI', eventType)
    rulesEngine.engine.addRule(SSSIrule)
    var actions = parcelsTestData.map(parcel => {
      return rulesEngine.engine.run(parcel)
    })
    await Promise.all(actions)
    expect(successEvent).toHaveBeenCalledTimes(1)
  })

  test('eligibility rules run gets parcels without sssi', async () => {
    const acceptedParcels = []
    rulesEngine.engine.on('success', async (event, almanac, ruleResult) => {
      if (event.type === eventType) {
        almanac.addRuntimeFact(rulesEngine.enums.ruleRejected, true)
      } else if (event.type === rulesEngine.enums.acceptedEventName) {
        acceptedParcels.push(await almanac.factValue('ref'))
        successEvent()
      }
    })
    const enabledRules = rulesEngine.enabledEligibilityRules(testRules)
    const conditions = rulesEngine.conditionsFromRules(enabledRules)
    SSSIrule = rulesEngine.buildStandardRule(conditions, 'SSSI', eventType)
    rulesEngine.engine.addRule(SSSIrule)
    const acceptedRule = rulesEngine.buildAcceptedItemsRule()
    rulesEngine.engine.addRule(acceptedRule)
    var actions = parcelsTestData.map(parcel => {
      return rulesEngine.engine.run(parcel)
    })
    await Promise.all(actions)

    expect(acceptedParcels.includes('SD74445738')).toBe(true)
    expect(acceptedParcels.includes('SD75492628')).toBe(true)
    expect(acceptedParcels.includes('SD81437506')).toBe(true)
    expect(acceptedParcels.includes('SD81525709')).toBe(true)
    expect(acceptedParcels.length).toBe(4)
  })

  afterAll(() => {
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })
})

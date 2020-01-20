describe('Rules engine Actiondate rule test', () => {
  let rulesEngine
  const parcelsTestData = require('./test-data/parcels-actiondate.json')
  const testRules = require('./test-data/rules-actiondate.json')
  const successEvent = jest.fn()
  const eventType = 'actiondate'
  const actiondateParcelRefs = ['SD75492628', 'SD81437506']

  beforeAll(() => {
    rulesEngine = require('../../server/rules-engine')
  })

  beforeEach(() => {
    rulesEngine.resetEngine()
  })

  test('actiondate rule discards parcel with invalid actiondate', async () => {
    const enabledRules = rulesEngine.enabledEligibilityRules(testRules)
    const conditions = rulesEngine.conditionsFromRules(enabledRules)
    rulesEngine.setupStandardRule(conditions, 'ActionDate', eventType)
    rulesEngine.engine.on('success', async (event, almanac, ruleResult) => {
      if (event.type === eventType) {
        successEvent()
      }
    })
    var actions = parcelsTestData.map(parcel => {
      return rulesEngine.runEngine(parcel)
    })
    await Promise.all(actions)
    // There are two invalid parcels in the data
    expect(successEvent).toHaveBeenCalledTimes(2)
  })

  test('eligibility rules run gets parcels without invalid actiondate', async () => {
    const acceptedParcels = []
    const enabledRules = rulesEngine.enabledEligibilityRules(testRules)
    const conditions = rulesEngine.conditionsFromRules(enabledRules)
    rulesEngine.setupStandardRule(conditions, 'ActionDate', eventType)
    rulesEngine.setupAcceptedItemsRule(async function (event, almanac, ruleResult) {
      acceptedParcels.push(await almanac.factValue('ref'))
      successEvent()
    })
    var actions = parcelsTestData.map(parcel => {
      return rulesEngine.runEngine(parcel)
    })
    await Promise.all(actions)

    // Check each acceptedParcel entry against the actiondate parcel list
    expect(acceptedParcels.some(accepted => actiondateParcelRefs.includes(accepted))).toBe(false)

    // There are threee valid parcels in the data
    expect(acceptedParcels.length).toBe(3)
    expect(successEvent).toHaveBeenCalledTimes(3)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})

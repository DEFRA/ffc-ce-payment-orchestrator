describe('Rules engine prevalidation rules test', () => {
  let rulesEngine
  const parcelsTestData = require('./test-data/parcels-prevalidation.json')

  beforeAll(() => {
    rulesEngine = require('../../server/rules-engine')
  })

  beforeEach(() => {
    rulesEngine.resetEngine()
  })

  test('prevalidation rules calculate usable perimeter', async () => {
    const expectedResults = [
      {
        ref: 'SD74445738',
        value: 139.3
      },
      {
        ref: 'SD75492628',
        value: 504.9
      },
      {
        ref: 'SD78379604',
        value: 645.3
      },
      {
        ref: 'SD81437506',
        value: 331.6
      },
      {
        ref: 'SD81525709',
        value: 140.4
      }]
    const prevalidateRules = require('./test-data/rules-prevalidation.json')
    const enabledRules = rulesEngine.enabledRules(prevalidateRules)
    const calculatedFacts = rulesEngine.factHandler.getCalculatedFacts(enabledRules)
    const calcRules = rulesEngine.factHandler.buildCalculationRules(calculatedFacts)
    rulesEngine.loadCalculationRules(calcRules)
    const actionsPromises = parcelsTestData.map(parcel => {
      return rulesEngine.runEngine(parcel)
    })
    const actions = await Promise.all(actionsPromises)
    expect.assertions(6)
    expect(actions.length).toBe(5)
    await Promise.all(actions.map(async action => {
      const ref = await action.almanac.factValue('ref')
      const usablePerimeter = await action.almanac.factValue('usablePerimeter')
      const expected = expectedResults.find(result => result.ref === ref)
      expect(expected.value).toBeCloseTo(usablePerimeter, 1)
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})

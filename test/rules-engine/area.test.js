describe('Rules engine Area rule test', () => {
  let rulesEngine
  const parcelsTestData = require('./test-data/parcels-area.json')
  const testRules = require('./test-data/rules-area.json')
  const areaParcelRefs = ['SD78379604', 'SD81437506']

  beforeAll(() => {
    rulesEngine = require('../../server/rules-engine')
  })

  beforeEach(() => {
    rulesEngine.resetEngine()
  })

  test('area rule discards parcels with an action date in the last 5 years', async () => {
    const acceptedParcels = []
    const successFunc = async function (event, almanac, ruleResult) {
      const ref = await almanac.factValue('ref')
      acceptedParcels.push(ref)
    }
    await rulesEngine.doFullRun(testRules, parcelsTestData, { quantity: 1000 }, successFunc)
    expect(acceptedParcels).toHaveLength(areaParcelRefs.length)
    expect(acceptedParcels).arrayContaining(areaParcelRefs)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})

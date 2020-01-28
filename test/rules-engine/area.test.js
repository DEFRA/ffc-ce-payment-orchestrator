describe('Rules engine Area rule test', () => {
  let rulesEngine
  const parcelsTestData = require('./test-data/parcels-area.json')
  const testRules = require('./test-data/rules-area.json')
<<<<<<< HEAD
  const areaParcelRefs = ['SD75492628', 'SD78379604', 'SD81437506']
=======
  const areaParcelRefs = ['SD78379604', 'SD81437506']
>>>>>>> Add new rule, plus tests

  beforeAll(() => {
    rulesEngine = require('../../server/rules-engine')
  })

  beforeEach(() => {
    rulesEngine.resetEngine()
  })

<<<<<<< HEAD
  test('area rule discards parcels with an usable area too low', async () => {
=======
  test('area rule discards parcels with an action date in the last 5 years', async () => {
>>>>>>> Add new rule, plus tests
    const acceptedParcels = []
    const successFunc = async function (event, almanac, ruleResult) {
      const ref = await almanac.factValue('ref')
      acceptedParcels.push(ref)
    }
<<<<<<< HEAD
    await rulesEngine.doFullRun(testRules, parcelsTestData, { quantity: 0.6 }, successFunc)
    expect(acceptedParcels).toHaveLength(areaParcelRefs.length)
    expect(acceptedParcels).toEqual(expect.arrayContaining(areaParcelRefs))
=======
    await rulesEngine.doFullRun(testRules, parcelsTestData, { quantity: 1000 }, successFunc)
    expect(acceptedParcels).toHaveLength(areaParcelRefs.length)
    expect(acceptedParcels).arrayContaining(areaParcelRefs)
>>>>>>> Add new rule, plus tests
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})

describe('Rules engine Area rule test', () => {
  let rulesEngine
  const parcelsTestData = require('./test-data/parcels-area.json')
  const ruleService = require('../../server/services/rulesService')
  let testRules

  beforeAll(async () => {
    rulesEngine = require('../../server/rules-engine')
    testRules = await ruleService.get()
  })

  beforeEach(() => {
    rulesEngine.resetEngine()
  })

  test('"area rule excluding features" discards parcels with an usable area too low', async () => {
    const areaParcelRefs = ['SD75492628', 'SD78379604', 'SD81437506']
    const acceptedParcels = []
    const successFunc = async function (event, almanac, ruleResult) {
      const ref = await almanac.factValue('ref')
      acceptedParcels.push(ref)
    }
    const rule = { enabled: true, ...testRules.find(x => x.id === 6) }
    await rulesEngine.doFullRun([rule], parcelsTestData, { quantity: 0.6 }, successFunc)
    expect(acceptedParcels).toHaveLength(areaParcelRefs.length)
    expect(acceptedParcels).toEqual(expect.arrayContaining(areaParcelRefs))
  })

  test('"area rule" discards parcels with an usable area too low but ignores features', async () => {
    const areaParcelRefs = ['SD74445738', 'SD75492628', 'SD78379604', 'SD81437506']
    const acceptedParcels = []
    const successFunc = async function (event, almanac, ruleResult) {
      const ref = await almanac.factValue('ref')
      acceptedParcels.push(ref)
    }
    const rule = { enabled: true, ...testRules.find(x => x.id === 7) }
    await rulesEngine.doFullRun([rule], parcelsTestData, { quantity: 0.6 }, successFunc)
    expect(acceptedParcels).toHaveLength(areaParcelRefs.length)
    expect(acceptedParcels).toEqual(expect.arrayContaining(areaParcelRefs))
  })
})

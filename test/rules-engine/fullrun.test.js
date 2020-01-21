describe('Rules engine prevalidation rules test', () => {
  let rulesEngine
  const parcelsTestData = require('./test-data/parcels-fulltest.json')
  const testRules = require('./test-data/rules-fulltest.json')

  beforeAll(() => {
    rulesEngine = require('../../server/rules-engine')
  })

  beforeEach(() => {
    rulesEngine.resetEngine()
  })

  test('Full run of data and rules works', async () => {
    const acceptedParcels = []
    const successFunc = async function (event, almanac, ruleResult) {
      almanac.factValue('ref').then(ref => {
        // console.log('Adding parcel to accepted parcels list: ', ref)
        acceptedParcels.push(ref)
      })
    }
    await rulesEngine.doFullRun(testRules, parcelsTestData, { requestedLength: 100 }, successFunc)
    // console.log(acceptedParcels)
    expect(acceptedParcels).toHaveLength(2)
    expect(acceptedParcels).toContain('SD81525709')
    expect(acceptedParcels).toContain('SD74445738')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})

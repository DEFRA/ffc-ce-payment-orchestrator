describe('Rules engine prevalidation rules test', () => {
  let rulesEngine
  // const parcelsTestData = require('./test-data/parcels-prevalidation.json')
  // const testRules = require('./test-data/rules-prevalidation.json')
  // const successEvent = jest.fn()
  // const eventType = 'prevalidation'
  // const actiondateParcelRefs = ['SD75492628', 'SD81437506']

  beforeAll(() => {
    rulesEngine = require('../../server/rules-engine')
  })

  beforeEach(() => {
    rulesEngine.resetEngine()
  })

  test('actiondate rule discards parcel with invalid actiondate', async () => {
  })

  test('eligibility rules run gets parcels without invalid actiondate', async () => {
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})

const rulesEngine = require('../../server/rules-engine')
const parcelsTestData = require('./test-data/parcels-fulltest.json')

describe('Eligibility rules test', () => {
  beforeEach(() => {
    rulesEngine.resetEngine()
  })

  test('Only eligibility rules run', async () => {
    const testCases = [
      {
        rules: [rulePreviousAction('eligibility'), ruleSSSI('prevalidation')],
        passingParcels: ['SD74445738', 'SD78379604', 'SD81525709']
      },
      {
        rules: [rulePreviousAction('eligibility'), ruleSSSI('eligibility')],
        passingParcels: ['SD78379604']
      }
    ]
    for (const testCase of testCases) {
      const acceptedParcels = []
      const successFunc = async (event, almanac, ruleResult) => {
        const ref = await almanac.factValue('ref')
        acceptedParcels.push(ref)
      }
      rulesEngine.resetEngine()
      await rulesEngine.doEligibilityRun(testCase.rules, parcelsTestData, {}, successFunc)
      expect(acceptedParcels).toHaveLength(testCase.passingParcels.length)
      expect(acceptedParcels).toEqual(
        expect.arrayContaining(testCase.passingParcels)
      )
    }
  })
})

const rulePreviousAction = type => ({
  id: 1,
  type,
  description: 'Previous Action date is within the last 5 years',
  enabled: true,
  facts: [
    {
      id: 'previousActions',
      description: 'Previous Action Dates'
    }
  ],
  conditions: [{
    fact: 'previousActions',
    path: '$..date',
    operator: 'lessThan5Years',
    value: '2020-01-20T00:00:01.000Z'
  }]
})

const ruleSSSI = type => ({
  id: 2,
  type,
  description: 'Parcel within SSSI',
  enabled: true,
  facts: [
    {
      id: 'SSSI',
      description: 'Parcel in SSSI area'
    }
  ],
  conditions: [{
    fact: 'SSSI',
    operator: 'notEqual',
    value: true
  }]
})

const rulesEngineHelper = require('../../server/rules-engine/helper')
const rulesEngine = require('../../server/services/rulesEngineService')

jest.mock('../../server/services/rulesEngineService')

describe('Rules engine helper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('doFullRun indicates that rules pass as per result from rules engine', async () => {
    rulesEngine.doFullRun.mockImplementation((r, p, o, successCallback) => {
      successCallback({ facts: {}, isEligible: true })
    })
    const runResult = await rulesEngineHelper.fullRun(getSampleAction(), getSampleParcel(), { quantity: 1 })
    expect(runResult.eligible).toBeTruthy()
  })

  test('doFullRun indicates that rules fail as per result from rules engine', async () => {
    rulesEngine.doFullRun.mockImplementation((r, p, o, successCallback) => {
      successCallback({ facts: {}, isEligible: false })
    })
    const runResult = await rulesEngineHelper.fullRun(getSampleAction(), getSampleParcel(), { quantity: 1 })
    expect(runResult.eligible).toBeFalsy()
  })

  test('doFullRun provides a value when rules pass as per result from rules engine', async () => {
    rulesEngine.doFullRun.mockImplementation((r, p, o, successCallback) => {
      successCallback({ facts: {}, isEligible: true })
    })
    const testCases = [
      { action: getSampleAction(98), data: { quantity: 22 }, expectedResult: 98 * 22 },
      { action: getSampleAction(5), data: { quantity: 128 }, expectedResult: 5 * 128 },
      { action: getSampleAction(991), data: { quantity: 3 }, expectedResult: 991 * 3 }
    ]
    for (const testCase of testCases) {
      const runResult = await rulesEngineHelper.fullRun(testCase.action, getSampleParcel(), testCase.data)
      expect(runResult.value).toBe(testCase.expectedResult)
    }
  })

  test('upperbound not provided when no eligible action available', async () => {
    const sampleAction = getSampleAction()
    sampleAction.rules[0].id = 1
    sampleAction.rules[0].enabled = false

    const runResult = await rulesEngineHelper.preCheckRun(sampleAction, getSampleParcel(), { quantity: sampleAction.lowerBound })
    expect(runResult.upperbound).toBeUndefined()
  })

  test('provides an upperbound fact from parcel data when quantity rule enabled', async () => {
    const testCases = [
      { upperbound: 101.2 },
      { upperbound: 87 },
      { upperbound: 3 }
    ]
    const sampleAction = getSampleAction()
    sampleAction.rules[0].id = 1
    sampleAction.rules[0].enabled = true

    for (const testCase of testCases) {
      const sampleParcel = getSampleParcel()
      sampleParcel.totalPerimeter = testCase.upperbound
      const runResult = await rulesEngineHelper.preCheckRun(sampleAction, sampleParcel, { quantity: sampleAction.lowerBound })
      expect(runResult.upperbound).toBe(testCase.upperbound)
    }
  })

  test('provides an upperbound fact from the rules engine when remove feature rule enabled', async () => {
    const testCases = [
      { upperbound: 101.2 },
      { upperbound: 87 },
      { upperbound: 3 }
    ]
    const sampleAction = getSampleAction()
    sampleAction.rules[0].id = 2
    sampleAction.rules[0].enabled = true

    for (const testCase of testCases) {
      rulesEngine.doFullRun.mockImplementation((r, p, o, successCallback) => {
        successCallback({ facts: { adjustedPerimeter: testCase.upperbound }, isEligible: true })
      })
      const runResult = await rulesEngineHelper.preCheckRun(sampleAction, getSampleParcel(), { quantity: sampleAction.lowerBound })
      expect(runResult.upperbound).toBe(testCase.upperbound)
    }
  })

  const getSampleParcel = () => ({
    ref: 'SD12345678',
    totalArea: 9,
    totalPerimeter: 100,
    areaFeatures: [],
    perimeterFeatures: [],
    previousActions: [],
    sssi: false
  })

  const getSampleAction = (rate = 1, id = 'FG1') => ({
    id,
    description: 'An action',
    lowerBound: 1,
    rate,
    rules: getSampleRules()
  })

  const getSampleRules = () => [
    {
      id: 1,
      type: 'prevalidation',
      groupname: 'Perimeter',
      description: 'Proposed fence length is longer than Total Parcel Perimeter',
      enabled: true,
      facts: [
        {
          id: 'totalPerimeter',
          description: 'Total Parcel Perimeter'
        }
      ],
      conditions: [{
        fact: 'quantity',
        operator: 'greaterThan',
        value: {
          fact: 'totalPerimeter'
        }
      }]
    }
  ]
})

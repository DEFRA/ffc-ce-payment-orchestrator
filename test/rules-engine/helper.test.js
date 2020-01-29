const rulesEngineHelper = require('../../server/rules-engine/helper')
const rulesEngine = require('../../server/rules-engine')

jest.mock('../../server/rules-engine')

describe('Rules engine helper', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('indicates that rules pass as per result from rules engine', async () => {
    const runResult = await invokeRulesEngineHelperFullRun(getSampleAction, { quantity: 1 })
    expect(runResult.eligible).toBeTruthy()
  })

  test('indicates that rules fail as per result from rules engine', async () => {
    rulesEngine.doFullRun.mockReturnValue(Promise.resolve())
    const runResult = await rulesEngineHelper.fullRun(getSampleAction(), getSampleParcel(), { quantity: 1 })
    expect(runResult.eligible).toBeFalsy()
  })

  test('provides a value when rules pass as per result from rules engine', async () => {
    const testCases = [
      { action: getSampleAction(98), data: { quantity: 22 }, expectedResult: 98 * 22 },
      { action: getSampleAction(5), data: { quantity: 128 }, expectedResult: 5 * 128 },
      { action: getSampleAction(991), data: { quantity: 3 }, expectedResult: 991 * 3 }
    ]
    for (const testCase of testCases) {
      const runResult = await invokeRulesEngineHelperFullRun(testCase.action, testCase.data)
      expect(runResult.value).toBe(testCase.expectedResult)
    }
  })

  test('provides an upperBound fact when rules pass and almanac provides this fact', async () => {
    const testCases = [
      { almanac: getSampleAlmanac([['upperBound', 101.2]]), expectedResult: 101.2 },
      { almanac: getSampleAlmanac([['upperBound', 87]]), expectedResult: 87 },
      { almanac: getSampleAlmanac([['upperBound', 3]]), expectedResult: 3 }
    ]
    const sampleAction = getSampleAction()
    for (const testCase of testCases) {
      const runResult = await invokeRulesEngineHelperFullRun(
        sampleAction, { quantity: sampleAction.lowerBound }, testCase.almanac)
      expect(runResult.upperBound).toBe(testCase.expectedResult)
    }
  })

  test('resets rules engine', () => {
    rulesEngineHelper.fullRun(getSampleRules(), getSampleParcel(), { parameterValue: 1 })
    expect(rulesEngine.resetEngine).toHaveBeenCalled()
  })

  const invokeRulesEngineHelperFullRun = (action, actionData, almanac = getSampleAlmanac()) => {
    let successCallback
    let dfrResolve
    const dfrPromise = new Promise((resolve, reject) => {
      dfrResolve = resolve
    })
    rulesEngine.doFullRun.mockImplementation((r, p, o, callback) => {
      successCallback = callback
      return dfrPromise
    })

    const runPromise = rulesEngineHelper.fullRun(action, getSampleParcel(), actionData)
    successCallback(undefined, almanac)
    dfrResolve()
    return runPromise
  }

  const getSampleParcel = () => ({
    ref: 'SD12345678',
    totalPerimeter: 100,
    perimeterFeatures: [],
    previousActions: []
  })

  const getSampleAction = (rate = 1) => ({
    id: 'action-1',
    description: 'Action 1',
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

  const getSampleAlmanac = keyValues => ({
    factMap: new Map(keyValues)
  })
})

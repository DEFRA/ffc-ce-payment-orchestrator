const rulesEngineHelper = require('../../server/rules-engine/helper')
const rulesEngine = require('../../server/rules-engine')

jest.mock('../../server/rules-engine')

describe('Rules engine helper', () => {
  describe('full run tests', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    test('indicates that rules pass as per result from rules engine', async () => {
      const runResult = await invokeRulesEngineHelperFullRun(getSampleAction(), { quantity: 1 })
      expect(runResult.eligible).toBeTruthy()
    })

    test('indicates that rules fail as per result from rules engine', async () => {
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

    test('provides an upperbound fact when rules pass and almanac provides this fact', async () => {
      const testCases = [
        { almanac: getSampleAlmanac([['upperbound', 101.2]]), expectedResult: 101.2 },
        { almanac: getSampleAlmanac([['upperbound', 87]]), expectedResult: 87 },
        { almanac: getSampleAlmanac([['upperbound', 3]]), expectedResult: 3 }
      ]
      const sampleAction = getSampleAction()
      for (const testCase of testCases) {
        const runResult = await invokeRulesEngineHelperFullRun(
          sampleAction, { quantity: sampleAction.lowerBound }, testCase.almanac)
        expect(runResult.upperbound).toBe(testCase.expectedResult)
      }
    })

    test('resets rules engine before doing run', () => {
      rulesEngineHelper.fullRun(getSampleAction(), getSampleParcel(), { parameterValue: 1 })
      expect(rulesEngine.resetEngine).toHaveBeenCalled()
    })
  })

  describe('eligibility run tests', () => {
    test('indicates that rules pass as per result from rules engine', async () => {
      const runResult = await invokeRulesEngineHelperEligibilityRun(getSampleAction(), { quantity: 1 })
      expect(runResult.eligible).toBeTruthy()
    })

    test('indicates that rules fail as per result from rules engine', async () => {
      const runResult = await rulesEngineHelper.eligibiltyRun(getSampleAction(), getSampleParcel(), { quantity: 1 })
      expect(runResult.eligible).toBeFalsy()
    })

    test('only runs eligibility rules from action rules', async () => {
      const action = getSampleAction()
      const { rules } = action
      const eligibilityRules = rules.filter(r => r.type === 'eligibility')
      await invokeRulesEngineHelperEligibilityRun(action, { quantity: 1 })
      expect(rulesEngine.doFullRun).toHaveBeenCalledWith(
        eligibilityRules,
        expect.any(Object),
        expect.any(Object),
        expect.any(Function)
      )
    })

    test('resets rules engine before doing run', () => {
      rulesEngineHelper.eligibiltyRun(getSampleAction(), getSampleParcel(), { parameterValue: 1 })
      expect(rulesEngine.resetEngine).toHaveBeenCalled()
    })
  })

  const invokeRulesEngineHelperEligibilityRun = (action, actionData) => {
    return invokeRulesEngineHelper(rulesEngineHelper.eligibiltyRun, action, actionData)
  }

  const invokeRulesEngineHelperFullRun = (action, actionData, almanac) => {
    return invokeRulesEngineHelper(rulesEngineHelper.fullRun, action, actionData, almanac)
  }

  const invokeRulesEngineHelper = (runFunction, action, actionData, almanac = getSampleAlmanac()) => {
    let successCallback
    let dfrResolve
    const dfrPromise = new Promise((resolve, reject) => {
      dfrResolve = resolve
    })
    rulesEngine.doFullRun.mockImplementation((r, p, o, callback) => {
      successCallback = callback
      return dfrPromise
    })

    const runPromise = runFunction(action, getSampleParcel(), actionData)
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
      facts: [],
      conditions: []
    },
    {
      id: 2,
      type: 'prevalidation',
      groupname: 'Perimeter',
      description: 'Proposed fence length is longer than Total Parcel Perimeter minus the Perimeter features',
      enabled: true,
      facts: [],
      conditions: []
    },
    {
      id: 3,
      type: 'prevalidation',
      groupname: 'Perimeter',
      description: 'Proposed fence length is longer than Total Parcel Perimeter minus the Perimeter features including the Tolerance',
      enabled: true,
      facts: [],
      conditions: []
    },
    {
      id: 4,
      type: 'eligibility',
      groupname: 'Perimeter',
      description: 'Previous Action date is within the last 5 years',
      enabled: true,
      facts: [],
      conditions: []
    },
    {
      id: 5,
      type: 'eligibility',
      groupname: 'Perimeter',
      description: 'Parcel within SSSI',
      enabled: true,
      facts: [],
      conditions: []
    },
    {
      id: 6,
      type: 'prevalidation',
      groupname: 'Area',
      description: 'Proposed area is larger than the Total Parcel Area minus the Pond area of the Parcel Features',
      facts: []
    }
  ]

  const getSampleAlmanac = keyValues => ({
    factMap: new Map(keyValues)
  })
})

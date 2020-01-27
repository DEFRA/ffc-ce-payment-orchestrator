const rulesEngineHelper = require('../../server/rules-engine/helper')
const rulesEngine = require('../../server/rules-engine')

jest.mock('../../server/rules-engine')

describe('Rules engine helper', () => {
  beforeEach(() => {

  })

  test('indicates that rules pass as per result from rules engine', async () => {
    let successCallback
    let dfrResolve
    const dfrPromise = new Promise((resolve, reject) => {
      dfrResolve = resolve
    })
    rulesEngine.doFullRun.mockImplementation((r, p, o, callback) => {
      successCallback = callback
      return dfrPromise
    })

    const fullRunPromise = rulesEngineHelper.fullRun(getSampleRules(), getSampleParcel(), { parameterValue: 1 })
    successCallback()
    dfrResolve()
    const fullRunResult = await fullRunPromise
    expect(fullRunResult).toBeTruthy()
  })

  test('indicates that rules fail as per result from rules engine', async () => {
    rulesEngine.doFullRun.mockReturnValue(Promise.resolve())
    const runResult = await rulesEngineHelper.fullRun(getSampleRules(), getSampleParcel(), { parameterValue: 1 })
    expect(runResult).toBeFalsy()
  })

  test('resets rules engine', () => {
    rulesEngineHelper.fullRun(getSampleRules(), getSampleParcel(), { parameterValue: 1 })
    expect(rulesEngine.resetEngine).toHaveBeenCalled()
  })

  const getSampleParcel = () => ({
    ref: 'SD12345678',
    totalPerimeter: 100,
    perimeterFeatures: [],
    previousActions: []
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
        fact: 'requestedLength',
        operator: 'greaterThan',
        value: {
          fact: 'totalPerimeter'
        }
      }]
    }
  ]
})

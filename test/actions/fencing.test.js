const fencing = require('../../server/actions/fencing')
const config = require('../../server/config')
const rulesEngine = require('../../server/rules-engine')

jest.mock('../../server/config')
jest.mock('../../server/rules-engine')

describe('Fencing action tests', () => {
  beforeEach(() => {
    config.actions.fencingPricePerMetre = 4
    jest.clearAllMocks()
  })

  test('calculate value as perimeter * 4', () => {
    const testCases = [
      { options: { quantity: 12 }, result: 48 },
      { options: { quantity: 8 }, result: 32 },
      { options: { quantity: 56 }, result: 224 },
      { options: { quantity: 112 }, result: 448 }
    ]
    for (const testCase of testCases) {
      expect(fencing.calculateValue({}, testCase.options)).toBe(testCase.result)
    }
  })

  test('fencing price is derived from config', () => {
    config.actions.fencingPricePerMetre = 10
    const testCases = [
      { options: { quantity: 12 }, result: 120 },
      { options: { quantity: 8 }, result: 80 },
      { options: { quantity: 56 }, result: 560 },
      { options: { quantity: 112 }, result: 1120 }
    ]
    for (const testCase of testCases) {
      expect(fencing.calculateValue({}, testCase.options)).toBe(testCase.result)
    }
  })

  test('eligible for fencing action if rules pass', async () => {
    rulesEngine.doFullRun.mockImplementation(
      (rulesJson, dataJson, passedFacts, successFunc) => {
        successFunc()
        return Promise.resolve()
      }
    )

    expect(await fencing.isEligible({}, { quantity: 12 })).toBeTruthy()
  })

  test('ineligible for fencing action if rules don\'t pass', async () => {
    rulesEngine.doFullRun.mockImplementation(
      (rulesJson, dataJson, passedFacts, successFunc) => {
        return Promise.resolve()
      }
    )

    expect(await fencing.isEligible({}, { quantity: 12 })).toBeFalsy()
  })

  test('provides rules to rules engine', async () => {
    await fencing.isEligible({}, { quantity: 1 })
    expect(rulesEngine.doFullRun).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.any(Object),
      expect.any(Function)
    )
  })

  test('provides parcel data to rules engine', async () => {
    const parcelData = {
      ref: 'SD74445738',
      totalPerimeter: 325.2,
      perimeterFeatures: [
        {
          type: 'barn',
          length: 23.3
        },
        {
          type: 'hedgerow',
          length: 162.6
        }
      ],
      previousActions: []
    }
    await fencing.isEligible(parcelData, { quantity: 1 })
    expect(rulesEngine.doFullRun).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining(parcelData),
      expect.any(Object),
      expect.any(Function)
    )
  })

  test('provides action data to rules engine', async () => {
    const actionData = { quantity: 91 }
    await fencing.isEligible({}, actionData)
    expect(rulesEngine.doFullRun).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({ requestedLength: actionData.quantity }),
      expect.any(Function)
    )
  })
})

const fencing = require('../../server/actions/fencing')
const config = require('../../server/config')
jest.mock('../../server/config')

describe('Fencing action tests', () => {
  beforeEach(() => {
    config.actions.fencingPricePerMetre = 4
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
})

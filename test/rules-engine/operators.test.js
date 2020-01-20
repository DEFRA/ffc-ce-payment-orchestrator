const customOperators = require('../../server/rules-engine/operators')

describe('Rules engine rule test', () => {
  const mockRulesEngine = {
    operators: {},
    addOperator: jest.fn(function (opName, opFunc) {
      this.operators[opName] = opFunc
    }),
    callOperator: function (opName, factValue, jsonValue) {
      const func = this.operators[opName]
      return func(factValue, jsonValue)
    }
  }

  const registerCustomOps = function () {
    customOperators.addAdditionalOperators(mockRulesEngine)
  }

  test('All custom operators are registered', () => {
    registerCustomOps()
    expect(mockRulesEngine.addOperator).toHaveBeenCalled()
    expect(Object.keys(mockRulesEngine.operators).length).toBe(1)
  })

  test('lessThan5Years operator', async () => {
    registerCustomOps()
    expect(mockRulesEngine.callOperator('lessThan5Years', '2013-07-03T00:00:01.000Z', '2020-01-20T00:00:01.000Z')).toBe(false)
    expect(mockRulesEngine.callOperator('lessThan5Years', '2015-01-19T00:00:01.000Z', '2020-01-20T00:00:01.000Z')).toBe(false)
    expect(mockRulesEngine.callOperator('lessThan5Years', '2015-01-20T00:00:01.000Z', '2020-01-20T00:00:01.000Z')).toBe(false)
    expect(mockRulesEngine.callOperator('lessThan5Years', '2015-01-21T00:00:01.000Z', '2020-01-20T00:00:01.000Z')).toBe(true)
    expect(mockRulesEngine.callOperator('lessThan5Years', '2020-01-20T00:00:01.000Z', '2020-01-20T00:00:01.000Z')).toBe(true)
    expect(mockRulesEngine.callOperator('lessThan5Years', '2020-01-21T00:00:01.000Z', '2020-01-20T00:00:01.000Z')).toBe(true)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
})

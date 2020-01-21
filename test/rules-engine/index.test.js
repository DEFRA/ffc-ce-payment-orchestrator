describe('Rules engine help methods test', () => {
  let rulesEngine
  const rulesTestData = require('./test-data/rules-index.json')

  beforeAll(() => {
    rulesEngine = require('../../server/rules-engine')
  })

  beforeEach(() => {
    rulesEngine.resetEngine()
  })

  test('eligibilityRules function returns just the eligibilityRules', () => {
    const eligibilityRules = rulesEngine.enabledEligibilityRules(rulesTestData)
    expect(eligibilityRules[0].id).toEqual(4)
    expect(eligibilityRules[1].id).toEqual(5)
  })

  test('conditionsFromRules returns an array containing conditions', () => {
    const eligibilityRules = rulesEngine.enabledEligibilityRules(rulesTestData)
    const conditions = rulesEngine.conditionsFromRules(eligibilityRules)
    expect(conditions).toMatchObject([{ fact: 'SSSI', operator: 'equal', value: true }])
  })

  test('enabledRules excludes just the disabled rule', () => {
    const enabledRules = rulesEngine.enabledEligibilityRules(rulesTestData)
    expect(enabledRules.filter(rule => rule.id !== 1).length).toEqual(enabledRules.length)
  })

  test('factsHandler.getCalculatedFacts returns a sorted list of facts to calculate', () => {
    const prevalidateRules = require('./test-data/rules-prevalidation.json')
    const enabledRules = rulesEngine.enabledRules(prevalidateRules)
    const calculatedFacts = rulesEngine.factHandler.getCalculatedFacts(enabledRules)
    expect(calculatedFacts).toHaveLength(2)
  })

  test('factHandler.buildCalculationRules returns a list of rules', () => {
    const prevalidateRules = require('./test-data/rules-prevalidation.json')
    const enabledRules = rulesEngine.enabledRules(prevalidateRules)
    const calculatedFacts = rulesEngine.factHandler.getCalculatedFacts(enabledRules)
    const calcRules = rulesEngine.factHandler.buildCalculationRules(calculatedFacts)
    rulesEngine.loadCalculationRules(calcRules)
    expect(calcRules).toHaveLength(2)
  })
})

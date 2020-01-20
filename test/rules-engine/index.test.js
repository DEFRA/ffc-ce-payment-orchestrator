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
})

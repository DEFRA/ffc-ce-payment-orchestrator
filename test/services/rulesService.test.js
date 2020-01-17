const rulesService = require('../../server/services/rulesService')

jest.mock(
  '../../data/rules.json',
  () => ([
    {
      id: 1,
      description: 'Mock rule 1',
      enabled: true,
      facts: []
    },
    {
      id: 2,
      description: 'Mock rule 2',
      enabled: false,
      facts: []
    },
    {
      id: 3,
      description: 'Mock rule 3',
      enabled: true,
      facts: []
    }
  ])
)

describe('rulesService', () => {
  const ruleID1 = 1
  const ruleID2 = 2
  const enabled1 = false
  const enabled2 = true

  afterAll(() => {
    jest.unmock('../../data/rules.json')
  })

  test('rules service get returns an array', async () => {
    const rules = await rulesService.get()
    expect(Array.isArray(rules)).toEqual(true)
  })

  test('rules service get returns an array where the first element has an id of 1', async () => {
    const rules = await rulesService.get()
    expect(rules[0]).toMatchObject({ id: 1 })
  })

  test('rules service updateRuleEnabled returns empty object for unknown id', async () => {
    const rule = await rulesService.updateRuleEnabled(-1, false)
    expect(rule).toEqual(expect.any(Object))
  })

  test('rules service updateRuleEnabled returns updated rule object given known id', async () => {
    const rule = await rulesService.updateRuleEnabled(ruleID1, enabled1)
    expect(rule).toMatchObject({ id: ruleID1, enabled: enabled1 })
  })

  test('rules service updateRuleEnabled changes persist on multiple calls', async () => {
    await rulesService.updateRuleEnabled(ruleID1, enabled1)
    await rulesService.updateRuleEnabled(ruleID2, enabled2)
    const rules = await rulesService.get()

    expect(rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: ruleID1, enabled: enabled1 }),
        expect.objectContaining({ id: ruleID2, enabled: enabled2 }),
        expect.objectContaining({ id: 3, enabled: true })
      ])
    )
  })
})

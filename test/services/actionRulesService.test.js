const actionRulesService = require('../../server/services/actionRulesService')

const mockActionID = 'FG1'
const mockRuleID = 1
const mockEnabledChange = false

jest.mock(
  '../../data/rules.json',
  () => ([
    {
      id: 1,
      description: 'Mock rule 1',
      enabled: true,
      facts: []
    }
  ])
)

describe('actionRulesService', () => {
  test('action rules service returns empty object for unknown id', async () => {
    const rule = await actionRulesService.update(mockActionID, -1, false)
    expect(rule).toEqual(expect.any(Object))
  })

  test('action rules service returns a rule object containing given id and enabled state', async () => {
    const rule = await actionRulesService.update(mockActionID, mockRuleID, mockEnabledChange)
    expect(rule).toMatchObject({ id: mockRuleID, enabled: mockEnabledChange })
  })

  afterAll(() => {
    jest.unmock('../../data/rules.json')
  })
})

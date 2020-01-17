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

jest.mock('../../server/services/rulesService', () => ({
  updateRuleEnabled: jest.fn()
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce({
      id: 1,
      description: 'Mock rule 1',
      enabled: false,
      facts: []
    })
}))

describe('actionRulesService', () => {
  test('update returns null for unknown rule id', async () => {
    const rule = await actionRulesService.update(mockActionID, -1, false)
    expect(rule).toBeNull()
  })

  test('update returns a rule object containing given id and enabled state', async () => {
    const rule = await actionRulesService.update(mockActionID, mockRuleID, mockEnabledChange)
    expect(rule).toMatchObject({ id: mockRuleID, enabled: mockEnabledChange })
  })

  afterAll(() => {
    jest.unmock('../../data/rules.json')
    jest.unmock('../../server/services/rulesService')
  })
})

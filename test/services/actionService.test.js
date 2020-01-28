const rulesService = require('../../server/services/rulesService')

jest.mock('../../server/services/rulesService')
jest.mock('../../data/actions.json', () => {
  return [{
    id: 'TE1',
    description: 'Test action 1',
    rules: [
      {
        id: 1,
        enabled: false
      },
      {
        id: 2,
        enabled: true
      },
      {
        id: 3,
        enabled: false
      },
      {
        id: 4,
        enabled: true
      },
      {
        id: 5,
        enabled: true
      }
    ]
  },
  {
    id: 'TE2',
    description: 'Test action 2',
    rules: [
      {
        id: 4,
        enabled: false
      },
      {
        id: 5,
        enabled: false
      }
    ]
  }
  ]
})

const actionsService = require('../../server/services/actionsService')

const actionShape = expect.objectContaining({
  id: expect.any(String),
  description: expect.any(String),
  rules: expect.arrayContaining([expect.objectContaining({
    id: expect.any(Number),
    type: expect.any(String),
    description: expect.any(String),
    enabled: expect.any(Boolean),
    facts: expect.arrayContaining([expect.objectContaining({
      description: expect.any(String)
    })])
  })])
})

const actionShapeWithoutRules = expect.objectContaining({
  id: expect.any(String),
  description: expect.any(String)
})

describe('actionsService', () => {
  beforeAll(() => {
    rulesService.get.mockResolvedValue([{
      id: 1,
      description: 'Test rule 1',
      enabled: true,
      type: 'rule',
      facts: [{ description: 'Fact' }]
    },
    {
      id: 2,
      description: 'Test rule 2',
      enabled: true,
      type: 'rule',
      facts: [{ description: 'Fact' }]
    },
    {
      id: 3,
      description: 'Test rule 3',
      enabled: true,
      type: 'rule',
      facts: [{ description: 'Fact' }]
    },
    {
      id: 4,
      description: 'Test rule 4',
      enabled: true,
      type: 'rule',
      facts: [{ description: 'Fact' }]
    },
    {
      id: 5,
      description: 'Test rule 5',
      enabled: true,
      type: 'rule',
      facts: [{ description: 'Fact' }]
    }]
    )
  })

  test('get returns an array of actions', async () => {
    const actions = await actionsService.get()
    expect(actions).toEqual(expect.arrayContaining([actionShape]))
  })

  test('getById returns an action matching the requested ID', async () => {
    const actionId = 'TE1'
    const action = await actionsService.getById('TE1')
    expect(action).toStrictEqual(actionShapeWithoutRules)
    expect(action.id).toEqual(actionId)
    expect(action).not.toStrictEqual(actionShape)
  })

  test('getById returns null if no action has the requested ID', async () => {
    const action = await actionsService.getById('not-a-real-id')
    expect(action).toBe(null)
  })

  test('getByIdWithRules returns an action matching the requested ID', async () => {
    const actionId = 'TE1'
    const action = await actionsService.getByIdWithRules(actionId)
    expect(action).toStrictEqual(actionShape)
    expect(action.id).toEqual(actionId)
  })

  test('getByIdWithRules returns actions with independent rules', async () => {
    const actionTE1 = await actionsService.getByIdWithRules('TE1')
    expect(actionTE1).toStrictEqual(actionShape)
    const actionTE2 = await actionsService.getByIdWithRules('TE2')
    expect(actionTE2).toStrictEqual(actionShape)
    expect(actionTE1.rules.find(x => x.id === 4).enabled).toEqual(true)
    expect(actionTE2.rules.find(x => x.id === 4).enabled).toEqual(false)
    actionTE1.rules.find(x => x.id === 4).enabled = false
    expect(actionTE1.rules.find(x => x.id === 4).enabled).toEqual(false)
  })

  const mockActionID = 'TE1'
  const mockRuleID = 1
  const mockEnabledChange = false

  test('update returns null for unknown rule id', async () => {
    const rule = await actionsService.updateRuleEnabled(mockActionID, -1, false)
    expect(rule).toBeNull()
  })

  test('update returns a rule object containing given id and enabled state', async () => {
    const rule = await actionsService.updateRuleEnabled(mockActionID, mockRuleID, mockEnabledChange)
    expect(rule).toMatchObject({ id: mockRuleID, enabled: mockEnabledChange })
  })
})

const actionsService = require('../../server/services/actionsService')
const rulesService = require('../../server/services/rulesService')

jest.mock('../../server/services/rulesService')

const actionShape = expect.objectContaining({
  id: expect.any(String),
  description: expect.any(String),
  rules: expect.arrayContaining([expect.objectContaining({
    id: expect.any(Number),
    description: expect.any(String),
    enabled: expect.any(Boolean)
  })])
})

describe('actionsService', () => {
  beforeEach(() => {
    rulesService.get.mockReturnValue([{ id: 1, description: '', enabled: true }])
  })

  test('get returns an array of actions', async () => {
    const actions = await actionsService.get()
    expect(actions).toEqual(expect.arrayContaining([actionShape]))
  })

  test('getById returns an action matching the requested ID', async () => {
    const actionId = 'FG1'
    const action = await actionsService.getById('FG1')
    expect(action).toStrictEqual(actionShape)
    expect(action.id).toEqual(actionId)
  })

  test('getById returns null if no action has the requested ID', async () => {
    const action = await actionsService.getById('not-a-real-id')
    expect(action).toBe(null)
  })

  test('getByIdWithRules returns an action matching the requested ID', async () => {
    const actionId = 'FG1'
    const action = await actionsService.getByIdWithRules(actionId)
    expect(action).toStrictEqual(actionShape)
    expect(action.id).toEqual(actionId)
  })

  test('getByIdWithRules attaches the rules from rulesService', async () => {
    const mockRules = [
      { id: 1, description: 'Rule 1', enabled: true },
      { id: 2, description: 'Rule 2', enabled: false },
      { id: 3, description: 'Rule 3', enabled: true }
    ]
    rulesService.get.mockReturnValue(mockRules)
    const action = await actionsService.getByIdWithRules('FG1')
    expect(action.rules).toEqual(
      expect.arrayContaining(mockRules)
    )
  })
})

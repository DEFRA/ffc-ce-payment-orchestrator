const actionsService = require('../../server/services/actionsService')

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
})

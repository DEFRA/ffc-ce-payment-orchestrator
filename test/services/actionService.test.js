
const actionsService = require('../../server/services/actionsService')
describe('actionsService', () => {
  test('actions service returns an array', async () => {
    const actions = await actionsService.get()
    expect(Array.isArray(actions)).toEqual(true)
  })

  test('actions service returns an array where the first element has an id of 1', async () => {
    const actions = await actionsService.get()
    expect(actions[0]).toMatchObject({
      id: 'FG1',
      description: 'Fencing'
    })
  })

  test('actions service returns an object with a rules object embedded', async () => {
    const actions = await actionsService.get()
    expect(actions[0]).toHaveProperty('rules')
  })
})

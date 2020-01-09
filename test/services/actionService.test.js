
const actionsService = require('../../server/services/actionsService')
describe('actionsService', () => {
  test('actions service returns a actions object containing an array', async () => {
    expect.assertions(1)
    const actions = await actionsService.get()
    expect(Array.isArray(actions.actions)).toEqual(true)
  })

  test('actions service object contains an array where the first element has an id of 1', async () => {
    expect.assertions(1)
    const actions = await actionsService.get()
    expect(actions.actions[0]).toMatchObject({
      id: 'FG1',
      description: 'Fencing'
    })
  })
})

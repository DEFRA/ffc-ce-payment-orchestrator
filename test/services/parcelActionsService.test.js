const parcelActionsService = require('../../server/services/parcelActionsService')
const parcelRef = 'AB12345678'

describe('parcelActionService', () => {
  test('parcel actions service returns an array', async () => {
    const actions = await parcelActionsService.get(parcelRef)
    expect(Array.isArray(actions)).toEqual(true)
  })

  test('parcel actions service returns an array where the first element has an id of FG1', async () => {
    const actions = await parcelActionsService.get(parcelRef)
    expect(actions[0]).toMatchObject({
      id: 'FG1',
      description: 'Fencing'
    })
  })
})

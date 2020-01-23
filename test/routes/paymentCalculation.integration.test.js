const createServer = require('../../server/createServer')

describe('POST /parcels/{parcelRef/actions/{actionId}/payment-calculation', () => {
  let server

  const generateRequestOptions = (
    parcelRef,
    actionId,
    actionData
  ) => ({
    method: 'POST',
    url: `/parcels/${parcelRef}/actions/${actionId}/payment-calculation`,
    payload: {
      actionData
    }
  })

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('parcel SD78379604 is eligible for a payment under action FG1', async () => {
    const response = await server.inject(generateRequestOptions('SD78379604', 'FG1', { quantity: 45.2 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: true,
        value: 180.8
      })
    )
  })

  test('parcel SD81437506 isn\'t eligible for a payment under action FG1 - it has a previous action', async () => {
    const response = await server.inject(generateRequestOptions('SD74445738', 'FG1', { quantity: 363.7 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: false
      })
    )
  })
})

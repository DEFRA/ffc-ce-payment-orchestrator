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

  test('parcel SD74445738 is eligible for a payment under action FG1', async () => {
    const response = await server.inject(generateRequestOptions('SD74445738', 'FG1', { quantity: 139.2 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: true,
        value: 556.8
      })
    )
  })

  test('parcel SD75492628 isn\'t eligible for a payment under action FG1 - it has a previous action', async () => {
    const response = await server.inject(generateRequestOptions('SD75492628', 'FG1', { quantity: 104.8 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: false
      })
    )
  })
})

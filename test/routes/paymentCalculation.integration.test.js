const createServer = require('../../server/createServer')

describe('POST /parcels/{parcelRef/actions/{actionId}/payment-calculation', () => {
  let server

  const generateRequestOptions = (
    parcelRef = 'AA1111',
    actionId = 'aaa111',
    actionData = { quantity: 50 }
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

  test('responds as expected', async () => {
    const response = await server.inject(generateRequestOptions())
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: true,
        value: 200
      })
    )
  })
})

let server

async function setUpServer () {
  const createServer = require('../../server/createServer')
  server = await createServer()
  await server.initialize()
}

describe('POST /parcels/{parcelRef/actions/{actionId}/payment-calculation', () => {
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
    jest.resetModules()
  })
  afterEach(async () => {
    await server.stop()
  })

  test('parcel SD74445738 is eligible for a payment under action FG1 - all rules enabled (except adjusted perimeter rule)', async () => {
    jest.mock(
      '../../data/actions.json',
      () => [
        {
          id: 'FG1',
          description: 'Fencing',
          rate: 4,
          rules: [
            { id: 1, enabled: true },
            { id: 2, enabled: false },
            { id: 3, enabled: false },
            { id: 4, enabled: true },
            { id: 5, enabled: true }
          ]
        }
      ]
    )
    await setUpServer()
    const response = await server.inject(generateRequestOptions('SD74445738', 'FG1', { quantity: 139.4 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: true,
        value: 557.6
      })
    )
  })

  test('parcel SD74445738 is eligible for a payment under action FG1 - all rules enabled (except perimeter rule)', async () => {
    jest.mock(
      '../../data/actions.json',
      () => [
        {
          id: 'FG1',
          description: 'Fencing',
          rate: 4,
          rules: [
            { id: 1, enabled: false },
            { id: 2, enabled: true },
            { id: 3, enabled: false },
            { id: 4, enabled: true },
            { id: 5, enabled: true }
          ]
        }
      ]
    )
    await setUpServer()
    const response = await server.inject(generateRequestOptions('SD74445738', 'FG1', { quantity: 130 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: true,
        value: 520
      })
    )
  })

  test('parcel SD75492628 isn\'t eligible for a payment under action FG1 - it has a previous action', async () => {
    jest.mock(
      '../../data/actions.json',
      () => [
        {
          id: 'FG1',
          description: 'Fencing',
          rate: 4,
          rules: [
            { id: 1, enabled: false },
            { id: 2, enabled: false },
            { id: 3, enabled: false },
            { id: 4, enabled: true },
            { id: 5, enabled: false }
          ]
        }
      ]
    )
    await setUpServer()
    const response = await server.inject(generateRequestOptions('SD75492628', 'FG1', { quantity: 104.8 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: false
      })
    )
  })

  test('parcel SD74445738 isn\'t eligible for a payment under action FG1 - claimed perimeter is greater than parcel perimeter', async () => {
    jest.mock(
      '../../data/actions.json',
      () => [
        {
          id: 'FG1',
          description: 'Fencing',
          rate: 4,
          rules: [
            { id: 1, enabled: true },
            { id: 2, enabled: false },
            { id: 3, enabled: false },
            { id: 4, enabled: false },
            { id: 5, enabled: false }
          ]
        }
      ]
    )
    await setUpServer()
    const response = await server.inject(generateRequestOptions('SD74445738', 'FG1', { quantity: 326 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: false
      })
    )
  })

  test('parcel SD74445738 isn\'t eligible for a payment under action FG1 - claimed perimeter is greater than adjusted perimeter', async () => {
    jest.mock(
      '../../data/actions.json',
      () => [
        {
          id: 'FG1',
          description: 'Fencing',
          rate: 4,
          rules: [
            { id: 1, enabled: false },
            { id: 2, enabled: true },
            { id: 3, enabled: false },
            { id: 4, enabled: false },
            { id: 5, enabled: false }
          ]
        }
      ]
    )
    await setUpServer()
    const response = await server.inject(generateRequestOptions('SD74445738', 'FG1', { quantity: 139.4 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: false
      })
    )
  })

  test('parcel SD78379604 isn\'t eligible for a payment under action FG1 - it is an SSSI', async () => {
    jest.mock(
      '../../data/actions.json',
      () => [
        {
          id: 'FG1',
          description: 'Fencing',
          rate: 4,
          rules: [
            { id: 1, enabled: false },
            { id: 2, enabled: false },
            { id: 3, enabled: false },
            { id: 4, enabled: false },
            { id: 5, enabled: true }
          ]
        }
      ]
    )
    await setUpServer()
    const response = await server.inject(generateRequestOptions('SD78379604', 'FG1', { quantity: 45.0 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: false
      })
    )
  })
})

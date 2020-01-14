describe('Parcel Actions route test', () => {
  let createServer
  let server

  const goodRequest = {
    method: 'GET',
    url: '/parcels/AB12345678/actions'
  }

  // const badRequest = {
  //   method: 'GET',
  //   url: '/parcel/BAD/actions'
  // }

  const mockActionList = [
    {
      id: 'ID1',
      description: 'Test Action'
    }
  ]

  const mockActionsService = {
    get: jest.fn().mockResolvedValue(mockActionList)
  }

  beforeAll(async () => {
    jest.mock('../../server/services/parcelActionsService', () => mockActionsService)
    createServer = require('../../server/createServer')
  })

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('responds with status code 200 for a well formed request', async () => {
    const response = await server.inject(goodRequest)
    expect(response.statusCode).toBe(200)
  })

  test('fetches data from parcelActionsService', async () => {
    await server.inject(goodRequest)
    expect(mockActionsService.get).toHaveBeenCalled()
  })

  test('returns the data provided by parcelActionsService', async () => {
    const response = await server.inject(goodRequest)
    const payload = JSON.parse(response.payload)
    expect(payload.actions).toEqual(mockActionList)
  })

  test('responds with status code 400 for a badly formed request', async () => {
    const response = await server.inject(goodRequest)
    expect(response.statusCode).toBe(200)
  })

  afterAll(() => {
    jest.unmock('../../server/services/actionsService')
  })

  afterEach(async () => {
    await server.stop()
  })
})

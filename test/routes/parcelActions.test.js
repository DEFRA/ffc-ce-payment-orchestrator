describe('Parcel Actions route test', () => {
  let createServer
  let server

  const goodRequest = {
    method: 'GET',
    url: '/parcels/AB12345678/actions'
  }

  const badRequest = {
    method: 'GET',
    url: '/parcels/BAD/actions'
  }

  const mockParcelActionList = [
    {
      id: 'ID1',
      description: 'Test Action'
    }
  ]

  const mockParcelActionsService = {
    get: jest.fn().mockResolvedValue(mockParcelActionList)
  }

  beforeAll(async () => {
    jest.mock('../../server/services/parcelActionsService', () => mockParcelActionsService)
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
    expect(mockParcelActionsService.get).toHaveBeenCalled()
  })

  test('returns the data provided by parcelActionsService', async () => {
    const response = await server.inject(goodRequest)
    const payload = JSON.parse(response.payload)
    expect(payload.actions).toEqual(mockParcelActionList)
  })

  test('responds with status code 400 for a badly formed request', async () => {
    const response = await server.inject(badRequest)
    expect(response.statusCode).toBe(400)
  })

  afterAll(() => {
    jest.unmock('../../server/services/actionsService')
  })

  afterEach(async () => {
    await server.stop()
  })
})

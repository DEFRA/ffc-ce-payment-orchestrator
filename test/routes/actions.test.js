describe('Actions route test', () => {
  let createServer
  let server

  const request = {
    method: 'GET',
    url: '/actions'
  }

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
    jest.mock('../../server/services/actionsService', () => mockActionsService)
    createServer = require('../../server/createServer')
  })

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('responds with status code 200', async () => {
    const response = await server.inject(request)
    expect(response.statusCode).toBe(200)
  })

  test('fetches data from actionsService', async () => {
    await server.inject(request)
    expect(mockActionsService.get).toHaveBeenCalled()
  })

  test('returns the data provided by actionsService', async () => {
    const response = await server.inject(request)
    const payload = JSON.parse(response.payload)
    expect(payload.actions).toEqual(mockActionList)
  })

  afterAll(() => {
    jest.unmock('../../server/services/actionsService')
  })

  afterEach(async () => {
    await server.stop()
  })
})

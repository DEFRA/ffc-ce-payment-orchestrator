describe('Web test', () => {
  let createServer
  let server

  const request = {
    method: 'GET',
    url: '/rules'
  }

  const mockRulesList = [
    {
      id: 9999,
      description: 'test rule one',
      enabled: true
    }
  ]

  const mockRulesService = {
    get: jest.fn().mockResolvedValue(mockRulesList)
  }

  beforeAll(async () => {
    jest.mock('../../server/services/rulesService', () => mockRulesService)
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

  test('fetches data from rulesService', async () => {
    await server.inject(request)
    expect(mockRulesService.get).toHaveBeenCalled()
  })

  afterAll(() => {
    jest.unmock('../../server/services/rulesService')
  })

  afterEach(async () => {
    await server.stop()
  })
})

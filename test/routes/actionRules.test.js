describe('Action rules route test', () => {
  let createServer
  let server

  const goodRequest = {
    method: 'PUT',
    url: '/actions/FG1/rules/3',
    payload: { enabled: true }
  }

  const badRequestParams = {
    method: 'PUT',
    url: '/actions/FG1/rules/ABC',
    payload: { enabled: true }
  }

  const badRequestPayload = {
    method: 'PUT',
    url: '/actions/FG1/rules/3',
    payload: { enabled: '123' }
  }

  const mockUpdatedRule = {
    id: 3,
    description: 'Rule description',
    enabled: false,
    facts: [{ description: 'Total Parcel Perimeter' }]
  }

  const mockActionRulesService = {
    update: jest.fn().mockResolvedValue(mockUpdatedRule)
  }

  beforeAll(async () => {
    jest.mock('../../server/services/actionRulesService', () => mockActionRulesService)
    createServer = require('../../server/createServer')
  })

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('calls the actionRulesService', async () => {
    await server.inject(goodRequest)
    expect(mockActionRulesService.update).toHaveBeenCalled()
  })

  test('returns the updated data from actionRulesService', async () => {
    const response = await server.inject(goodRequest)
    const payload = JSON.parse(response.payload)
    expect(payload).toEqual(mockUpdatedRule)
  })

  test('responds with status code 200 for a well formed request', async () => {
    const response = await server.inject(goodRequest)
    expect(response.statusCode).toBe(200)
  })

  test('responds with status code 400 for a badly formed request params', async () => {
    const response = await server.inject(badRequestParams)
    expect(response.statusCode).toBe(400)
  })

  test('responds with status code 400 for a badly formed request payload', async () => {
    const response = await server.inject(badRequestPayload)
    expect(response.statusCode).toBe(400)
  })

  afterAll(() => {
    jest.unmock('../../server/services/actionRulesService')
  })

  afterEach(async () => {
    await server.stop()
  })
})

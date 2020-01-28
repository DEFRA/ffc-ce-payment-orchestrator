describe('Action rules route test', () => {
  let createServer
  let server

  const actionID = 'FG1'
  const ruleID = 3

  const goodRequest = {
    method: 'PUT',
    url: `/actions/${actionID}/rules/${ruleID}`,
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

  const mockActionsService = {
    updateRuleEnabled: jest.fn().mockResolvedValue(mockUpdatedRule)
  }

  beforeAll(async () => {
    jest.mock('../../server/services/actionsService', () => mockActionsService)
    createServer = require('../../server/createServer')
  })

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('calls the actionsService', async () => {
    await server.inject(goodRequest)
    expect(mockActionsService.updateRuleEnabled).toHaveBeenCalledWith(actionID, ruleID, goodRequest.payload.enabled)
  })

  test('returns the updated data from actionsService', async () => {
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
    jest.unmock('../../server/services/actionsService')
  })

  afterEach(async () => {
    await server.stop()
  })
})

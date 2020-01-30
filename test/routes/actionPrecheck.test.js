describe('Action precheck put route test', () => {
  let createServer
  let server

  const actionID = 'TE1'

  const goodRequest = {
    method: 'PUT',
    url: `/actions/${actionID}`,
    payload: { enabled: true }
  }

  const badRequestPayload = {
    method: 'PUT',
    url: '/actions/TE1',
    payload: { enabled: '123' }
  }

  const mockUpdatedAction = {
    id: 'TE1',
    description: 'Test action',
    rate: 1,
    precheck: true,
    rules: [
      {
        id: 1,
        enabled: true
      }
    ]
  }

  const mockActionsService = {
    updatePrecheckEnabled: jest.fn().mockResolvedValue(mockUpdatedAction)
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
    expect(mockActionsService.updatePrecheckEnabled).toHaveBeenCalledWith(actionID, goodRequest.payload.enabled)
  })

  test('returns the updated data from actionsService', async () => {
    const response = await server.inject(goodRequest)
    const payload = JSON.parse(response.payload)
    expect(payload).toEqual(mockUpdatedAction)
  })

  test('responds with status code 200 for a well formed request', async () => {
    const response = await server.inject(goodRequest)
    expect(response.statusCode).toBe(200)
  })

  test('responds with status code 400 for a badly formed request payload', async () => {
    const response = await server.inject(badRequestPayload)
    expect(response.statusCode).toBe(400)
  })

  afterEach(async () => {
    await server.stop()
  })
})

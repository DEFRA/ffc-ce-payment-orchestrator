describe('PUT /actions/{actionID}', () => {
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

  let createServer
  let actionsService
  let server

  const mockActionsService = {
    updatePrecheckEnabled: jest.fn().mockResolvedValue(mockUpdatedAction),
    getByIdWithRules: jest.fn().mockResolvedValue(mockUpdatedAction)
  }

  beforeAll(async () => {
    jest.mock('../../server/services/actionsService', () => mockActionsService)
    actionsService = require('../../server/services/actionsService')
    createServer = require('../../server/createServer')
  })

  const generateRequestOptions = (
    actionId = 'TE1',
    enabled = true
  ) => ({
    method: 'PUT',
    url: `/actions/${actionId}`,
    payload: { enabled: enabled }
  })

  beforeEach(async () => {
    jest.clearAllMocks()
    actionsService.getByIdWithRules.mockResolvedValue(mockUpdatedAction)
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('responds with status code 200', async () => {
    const response = await server.inject(generateRequestOptions())
    expect(response.statusCode).toBe(200)
  })

  test('returns the updated data from actionsService', async () => {
    const response = await server.inject(generateRequestOptions())
    const payload = JSON.parse(response.payload)
    expect(payload).toEqual(mockUpdatedAction)
  })

  test('calls the actionsService', async () => {
    const request = generateRequestOptions('TE1', true)
    await server.inject(request)
    expect(mockActionsService.updatePrecheckEnabled).toHaveBeenCalledWith('TE1', request.payload.enabled)
  })

  test('responds with status code 400 for a badly formed request payload', async () => {
    const response = await server.inject(generateRequestOptions('TE1', 'bad'))
    expect(response.statusCode).toBe(400)
  })

  test('returns the updated data from actionsService', async () => {
    const response = await server.inject(generateRequestOptions())
    const payload = JSON.parse(response.payload)
    expect(payload).toEqual(mockUpdatedAction)
  })
})

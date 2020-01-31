let server

async function setUpServer () {
  const createServer = require('../../server/createServer')
  server = await createServer()
  await server.initialize()
}

const mockUpdatedAction = {
  id: 'FG1',
  description: 'Fencing',
  rate: 4,
  precheck: false,
  rules: [
    { id: 2, enabled: true }
  ]
}

describe('PUT /actions/{actionID}', () => {
  beforeEach(async () => {
    jest.mock(
      '../../data/actions.json',
      () => [mockUpdatedAction
      ]
    )
    await setUpServer()
  })

  const generateRequestOptions = (
    actionId = 'FG1',
    enabled = true
  ) => ({
    method: 'PUT',
    url: `/actions/${actionId}`,
    payload: { enabled: enabled }
  })

  afterEach(async () => {
    await server.stop()
  })

  test('responds with status code 200', async () => {
    const response = await server.inject(generateRequestOptions())
    expect(response.statusCode).toBe(200)
  })

  test('returns the updated data from actionsService when setting to true', async () => {
    const response = await server.inject(generateRequestOptions())
    const payload = JSON.parse(response.payload)
    const { rules, ...resultAction } = mockUpdatedAction
    resultAction.precheck = true
    expect(payload).toEqual(expect.objectContaining(resultAction))
  })

  test('responds with status code 400 for a badly formed request payload', async () => {
    const response = await server.inject(generateRequestOptions('FG1', 'bad'))
    expect(response.statusCode).toBe(400)
  })

  test('responds with status code 400 for an unknown action ID', async () => {
    const response = await server.inject(generateRequestOptions('TE1', false))
    expect(response.statusCode).toBe(400)
  })

  test('returns the updated data from actionsService when setting to false', async () => {
    const response = await server.inject(generateRequestOptions('FG1', false))
    const payload = JSON.parse(response.payload)
    const { rules, ...resultAction } = mockUpdatedAction
    resultAction.precheck = false
    expect(payload).toEqual(expect.objectContaining(resultAction))
  })
})

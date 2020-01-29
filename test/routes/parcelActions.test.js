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
    jest.unmock('../../server/services/parcelActionsService')
  })

  afterEach(async () => {
    await server.stop()
  })
})

describe('GET /parcels/{parcelRef}/actions/{actionId}', () => {
  const createServer = require('../../server/createServer')
  const parcelService = require('../../server/services/parcelService')
  const actionsService = require('../../server/services/actionsService')
  const rulesEngineHelper = require('../../server/rules-engine/helper')
  let server

  jest.mock('../../server/services/parcelService')
  jest.mock('../../server/services/actionsService')
  jest.mock('../../server/rules-engine/helper')

  const generateRequestOptions = (
    parcelRef = 'AA1111',
    actionId = 'aaa111'
  ) => ({
    method: 'GET',
    url: `/parcels/${parcelRef}/actions/${actionId}`
  })

  beforeEach(async () => {
    jest.clearAllMocks()
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

  test('provides parcel ref when retrieving parcel details', async () => {
    const parcelRef = 'LG09876'
    await server.inject(generateRequestOptions(parcelRef))
    expect(parcelService.getByRef).toHaveBeenCalledWith(parcelRef)
  })

  test('provides action id when retrieving action details', async () => {
    const actionId = 'abc123'
    await server.inject(generateRequestOptions(undefined, actionId))
    expect(actionsService.getByIdWithRules).toHaveBeenCalledWith(actionId)
  })

  test('provides correct arguments to rules engine runner', async () => {
    const options = generateRequestOptions()
    const sampleParcel = getSampleParcel()
    const sampleAction = getSampleAction()
    parcelService.getByRef.mockResolvedValue(sampleParcel)
    actionsService.getByIdWithRules.mockResolvedValue(sampleAction)

    await server.inject(options)

    expect(rulesEngineHelper.fullRun).toHaveBeenCalledWith(
      expect.objectContaining(sampleAction),
      expect.objectContaining(sampleParcel),
      expect.objectContaining({ quantity: 1 })
    )
  })

  const getSampleParcel = () => ({
    ref: 'SD12345678',
    totalPerimeter: 100,
    perimeterFeatures: [],
    previousActions: []
  })

  const getSampleAction = (rate = 1) => ({
    id: 'action-1',
    description: 'Action 1',
    rate,
    rules: getSampleRules()
  })

  const getSampleRules = () => [
    {
      id: 1,
      type: 'prevalidation',
      groupname: 'Perimeter',
      description: 'Proposed fence length is longer than Total Parcel Perimeter',
      enabled: true,
      facts: [
        {
          id: 'totalPerimeter',
          description: 'Total Parcel Perimeter'
        }
      ],
      conditions: [{
        fact: 'quantity',
        operator: 'greaterThan',
        value: {
          fact: 'totalPerimeter'
        }
      }]
    }
  ]
})

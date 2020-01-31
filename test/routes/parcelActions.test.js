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
    rulesEngineHelper.fullRun.mockResolvedValue({ upperbound: {} })
    actionsService.getByIdWithRules.mockResolvedValue({ input: {} })
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
    parcelService.getByRef.mockReturnValue(sampleParcel)
    actionsService.getByIdWithRules.mockResolvedValue(sampleAction)

    await server.inject(options)

    expect(rulesEngineHelper.fullRun).toHaveBeenCalledWith(
      expect.objectContaining(sampleAction),
      expect.objectContaining(sampleParcel),
      expect.objectContaining({ quantity: sampleAction.input.lowerbound })
    )
  })

  test('provides input description as given in action', async () => {
    const sampleAction = getSampleAction()
    actionsService.getByIdWithRules.mockResolvedValue(sampleAction)
    const response = await server.inject(generateRequestOptions())
    const responseData = JSON.parse(response.payload)

    expect(responseData).toEqual(
      expect.objectContaining({
        id: sampleAction.id,
        description: sampleAction.description,
        input: expect.objectContaining(sampleAction.input)
      })
    )
  })

  test('elaborates input description with upperbound provided by rules engine runner', async () => {
    const upperbound = getUpperboundFact(40)
    rulesEngineHelper.fullRun.mockResolvedValue({ eligible: true, value: 100, upperbound })
    const response = await server.inject(generateRequestOptions())
    const responseData = JSON.parse(response.payload)

    expect(responseData.input).toEqual(
      expect.objectContaining({ upperbound: upperbound.value })
    )
  })

  test('rounds upperbound provided by rules engine runner to two decimal places', async () => {
    const testCases = [
      { upperbound: getUpperboundFact(739.3000000000001), expectedValue: 739.3 },
      { upperbound: getUpperboundFact(40.2699999999999), expectedValue: 40.27 },
      { upperbound: getUpperboundFact(78.8383838383838), expectedValue: 78.84 },
      { upperbound: getUpperboundFact(44.4444444444444), expectedValue: 44.44 },
      { upperbound: getUpperboundFact(55.5555555555555), expectedValue: 55.56 },
      { upperbound: getUpperboundFact(1.005), expectedValue: 1.01 }
    ]
    for (const testCase of testCases) {
      const { upperbound, expectedValue } = testCase
      rulesEngineHelper.fullRun.mockResolvedValue({ eligible: true, value: 100, upperbound })
      const response = await server.inject(generateRequestOptions())
      const responseData = JSON.parse(response.payload)

      expect(responseData.input).toEqual(
        expect.objectContaining({ upperbound: expectedValue })
      )
    }
  })

  test('handles failing rules run', async () => {
    rulesEngineHelper.fullRun.mockResolvedValue({ eligible: false })
    expect(async () => {
      await server.inject(generateRequestOptions())
    }).not.toThrow()
  })

  test('when initiating a rules run, the lowerbound from the action is used as the quantity', async () => {
    const testCases = [0.1, 1.2, 12, 82]
    for (const testCase of testCases) {
      const sampleAction = getSampleAction(undefined, testCase)
      actionsService.getByIdWithRules.mockResolvedValue(sampleAction)
      await server.inject(generateRequestOptions())
      expect(rulesEngineHelper.fullRun).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        expect.objectContaining({ quantity: testCase })
      )
    }
  })

  test('omits action properties other than id, description and input', async () => {
    const sampleAction = getSampleAction()
    actionsService.getByIdWithRules.mockResolvedValue(sampleAction)
    const response = await server.inject(generateRequestOptions())
    const responseData = JSON.parse(response.payload)

    const responseKeys = Object.keys(responseData)
    expect(responseKeys).toHaveLength(3)
    expect(responseKeys).toEqual(
      expect.arrayContaining(['id', 'description', 'input'])
    )
  })

  const getSampleParcel = () => ({
    ref: 'SD12345678',
    totalPerimeter: 100,
    perimeterFeatures: [],
    previousActions: []
  })

  const getSampleAction = (rate = 1, lowerbound = 10) => ({
    id: 'crop-circle',
    description: 'Damages claim for UFO landings in field',
    rate,
    rules: getSampleRules(),
    input: {
      unit: 'metres',
      description: 'radius of flying saucer that landed in field',
      lowerbound
    }
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

  const getUpperboundFact = value => ({
    id: 'upperbound',
    options: { cache: true },
    priority: 1,
    type: 'CONSTANT',
    value
  })
})

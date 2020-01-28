const actionService = require('../../server/services/actionsService')
const parcelService = require('../../server/services/parcelService')
const paymentCalculationService = require('../../server/services/paymentCalculationService')
const rulesEngineHelper = require('../../server/rules-engine/helper')

jest.mock('../../server/services/actionsService')
jest.mock('../../server/services/parcelService')
jest.mock('../../server/services/paymentCalculationService')
jest.mock('../../server/rules-engine/helper')

describe('POST /payment-calculation', () => {
  let createServer
  let server

  const landParcel = { ref: '111111' }

  const actions = [
    {
      action: { id: 'FG1' },
      options: { quantity: 50 }
    }
  ]
  const request = {
    method: 'POST',
    url: '/payment-calculation',
    payload: {
      parcelRef: landParcel.ref,
      actions
    }
  }
  const mockEligibleResult = { value: '80', eligible: true }
  const mockIneligibleResult = { eligible: false }

  beforeAll(async () => {
    createServer = require('../../server/createServer')
  })

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  describe('with eligible request', () => {
    beforeAll(() => {
      actionService.getById.mockClear()
      parcelService.getByRef.mockClear()
      paymentCalculationService.isEligible.mockClear()
      paymentCalculationService.getValue.mockClear()

      actionService.getById.mockReturnValue(actions[0].action)
      parcelService.getByRef.mockReturnValue(landParcel)
      paymentCalculationService.isEligible.mockReturnValue(true)
      paymentCalculationService.getValue.mockReturnValue(mockEligibleResult.value)
    })

    test('responds with status code 200', async () => {
      const response = await server.inject(request)
      expect(response.statusCode).toBe(200)
    })

    test('fetches parcel data from parcelService', async () => {
      await server.inject(request)
      expect(parcelService.getByRef).toHaveBeenCalledWith(request.payload.parcelRef)
    })

    test('tests eligibility with paymentCalculationService', async () => {
      await server.inject(request)
      expect(paymentCalculationService.isEligible).toHaveBeenCalledWith(landParcel, actions)
    })

    test('fetches total value from paymentCalculationService', async () => {
      await server.inject(request)
      expect(paymentCalculationService.getValue).toHaveBeenCalledWith(landParcel, actions)
    })

    test('returns the data provided by paymentCalculationService', async () => {
      const response = await server.inject(request)
      const responseData = JSON.parse(response.payload)
      expect(responseData).toEqual(mockEligibleResult)
    })
  })

  describe('with ineligible request', () => {
    beforeAll(() => {
      actionService.getById.mockClear()
      parcelService.getByRef.mockClear()
      paymentCalculationService.isEligible.mockClear()

      actionService.getById.mockReturnValue(actions[0].action)
      parcelService.getByRef.mockReturnValue(landParcel)
      paymentCalculationService.isEligible.mockReturnValue(false)
    })

    test('responds with status code 200', async () => {
      const response = await server.inject(request)
      expect(response.statusCode).toBe(200)
    })

    test('returns the fact that the land parcel is ineligible for the requested actions', async () => {
      const response = await server.inject(request)
      const responseData = JSON.parse(response.payload)
      expect(responseData).toEqual(mockIneligibleResult)
    })
  })
})

describe('POST /parcels/{parcelRef}/actions/{actionId}/payment-calculation', () => {
  const createServer = require('../../server/createServer')
  let server

  const generateRequestOptions = (
    parcelRef = 'AA1111',
    actionId = 'aaa111',
    actionData = { quantity: 50 }
  ) => ({
    method: 'POST',
    url: `/parcels/${parcelRef}/actions/${actionId}/payment-calculation`,
    payload: {
      actionData
    }
  })

  beforeEach(async () => {
    jest.clearAllMocks()

    actionService.getById.mockReturnValue({ action: { id: 'action-1' } })
    actionService.getByIdWithRules.mockReturnValue(getSampleAction())
    parcelService.getByRef.mockReturnValue({ ref: 'AA1111' })
    paymentCalculationService.isEligible.mockReturnValue(true)
    paymentCalculationService.getValue.mockReturnValue(80)
    rulesEngineHelper.fullRun.mockResolvedValue(true)

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

  test('provides parcel ref when calling getByRef on parcel service', async () => {
    const parcelRef = 'HK12345'
    await server.inject(generateRequestOptions(parcelRef))
    expect(parcelService.getByRef).toHaveBeenCalledWith(parcelRef)
  })

  test('provides action id when retrieving action from action service', async () => {
    const actionId = 'action1'
    const options = generateRequestOptions(undefined, actionId)
    await server.inject(options)
    expect(actionService.getByIdWithRules).toHaveBeenCalledWith(actionId)
  })

  test('provides correct parameters to rules engine', async () => {
    const sampleAction = getSampleAction()
    const sampleParcel = { id: 'sample parcel' }
    const actionData = { quantity: 111 }
    actionService.getByIdWithRules.mockResolvedValue(sampleAction)
    parcelService.getByRef.mockResolvedValue(sampleParcel)
    await server.inject(generateRequestOptions(undefined, undefined, actionData))
    expect(rulesEngineHelper.fullRun).toHaveBeenCalledWith(
      expect.objectContaining(sampleAction),
      expect.objectContaining(sampleParcel),
      expect.objectContaining(actionData)
    )
  })

  test('provides eligible flag matching flag from rulesEngineHelper.fullRun', async () => {
    const testCases = [true, false]
    for (const testCase of testCases) {
      rulesEngineHelper.fullRun.mockResolvedValue({ eligible: testCase })
      const response = await server.inject(generateRequestOptions())
      const responseData = JSON.parse(response.payload)
      expect(responseData).toEqual(expect.objectContaining({ eligible: testCase }))
    }
  })

  test('provides value matching calculated payment from rulesEngineHelper.fullRun', async () => {
    const testCases = [12, 38, 872]
    for (const testCase of testCases) {
      rulesEngineHelper.fullRun.mockResolvedValue({ eligible: true, value: testCase })
      const response = await server.inject(generateRequestOptions())
      const responseData = JSON.parse(response.payload)
      expect(responseData).toEqual(expect.objectContaining({ value: testCase }))
    }
  })

  test('omits value from payload when parcel and action are ineligible for a payment', async () => {
    rulesEngineHelper.fullRun.mockResolvedValue(false)
    const response = await server.inject(generateRequestOptions())
    const responseData = JSON.parse(response.payload)
    expect(Object.keys(responseData).includes('value')).toBeFalsy()
  })

  const getSampleAction = () => ({
    id: 'action-1',
    rules: [
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
          fact: 'requestedLength',
          operator: 'greaterThan',
          value: {
            fact: 'totalPerimeter'
          }
        }]
      }
    ]
  })
})

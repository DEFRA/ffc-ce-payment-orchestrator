const actionService = require('../../server/services/actionsService')
const parcelService = require('../../server/services/parcelService')
const paymentCalculationService = require('../../server/services/paymentCalculationService')

jest.mock('../../server/services/actionsService')
jest.mock('../../server/services/parcelService')
jest.mock('../../server/services/paymentCalculationService')

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

  afterAll(() => {
    jest.unmock('../../server/services/actionService')
    jest.unmock('../../server/services/parcelService')
    jest.unmock('../../server/services/paymentCalculationService')
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

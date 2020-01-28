const actionsService = require('../../server/services/actionsService')
const parcelService = require('../../server/services/parcelService')
const rulesEngineHelper = require('../../server/rules-engine/helper')

jest.mock('../../server/services/actionsService')
jest.mock('../../server/services/parcelService')
jest.mock('../../server/rules-engine/helper')

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

    actionsService.getByIdWithRules.mockReturnValue(getSampleAction())
    parcelService.getByRef.mockReturnValue({ ref: 'AA1111' })
    rulesEngineHelper.fullRun.mockResolvedValue({ eligible: true, value: 1 })

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
    expect(actionsService.getByIdWithRules).toHaveBeenCalledWith(actionId)
  })

  test('provides correct parameters to rules engine', async () => {
    const sampleAction = getSampleAction()
    const sampleParcel = { id: 'sample parcel' }
    const actionData = { quantity: 111 }
    actionsService.getByIdWithRules.mockResolvedValue(sampleAction)
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
    rulesEngineHelper.fullRun.mockResolvedValue({ eligible: false })
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

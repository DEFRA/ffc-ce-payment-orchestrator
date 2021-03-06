describe('GET /parcels', () => {
  let createServer
  let server

  const mockParcelList = [
    { ref: 'BsJ48Jdayiy6TTPT1F99yEtkjqw0UVT8MI3dmw2PB6Id' }
  ]

  const mockParcelService = {
    get: jest.fn().mockReturnValue(mockParcelList)
  }

  const request = {
    method: 'GET',
    url: '/parcels'
  }

  beforeAll(async () => {
    jest.mock('../../server/services/parcelService', () => mockParcelService)
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
    jest.unmock('../../server/services/parcelService')
  })

  test('responds with status code 200', async () => {
    const response = await server.inject(request)
    expect(response.statusCode).toBe(200)
  })

  test('fetches data from parcelService', async () => {
    await server.inject(request)
    expect(mockParcelService.get).toHaveBeenCalled()
  })

  test('returns the data provided by parcelService', async () => {
    const response = await server.inject(request)
    const payload = JSON.parse(response.payload)
    expect(payload.parcels).toEqual(mockParcelList)
  })
})

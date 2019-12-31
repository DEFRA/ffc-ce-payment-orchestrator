describe('Web test', () => {
  let createServer
  let server

  beforeAll(async () => {
    jest.mock('../server/services/paymentService')
    createServer = require('../server/createServer')
  })

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
    jest.clearAllMocks()
  })

  test('GET / route returns 404', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(404)
    expect((response.headers['content-type'])).toEqual(expect.stringContaining('application/json'))
  })

  test('POST /payment route fails with invalid content', async () => {
    const options = {
      method: 'POST',
      url: '/payment',
      payload: { }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(400)
  })

  test('POST /payment route works with valid content', async () => {
    const options = {
      method: 'POST',
      url: '/payment',
      payload: { email: 'test@example.com' }
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })

  afterAll(async () => {
    jest.unmock('../server/services/paymentService')
  })
})

describe('Web test', () => {
  let createServer
  let server

  beforeAll(async () => {
    createServer = require('../../server/createServer')
  })

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  test('GET /rules route works', async () => {
    const options = {
      method: 'GET',
      url: '/rules'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(200)
  })

  afterEach(async () => {
    await server.stop()
  })
})

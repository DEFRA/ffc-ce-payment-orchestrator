const schema = require('../schema/payment')
const paymentService = require('../services/paymentService')

module.exports = {
  method: 'POST',
  path: '/payment',
  options: {
    validate: {
      payload: schema,
      failAction: async (request, h, error) => {
        console.log('rejected payload', request.payload)
        return h.response().code(400).takeover()
      }
    },
    handler: async (request, h) => {
      console.log('new payment received', request.payload)
      const payment = await paymentService.create(request.payload)
      return h.response({ user: payment, date: new Date() }).code(200)
    }
  }
}

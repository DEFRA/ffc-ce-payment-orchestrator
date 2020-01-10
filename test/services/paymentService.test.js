const paymentService = require('../../server/services/paymentService')

describe('paymentService', () => {
  test('payment service returns email address of payment', () => {
    const email = 'test@address'
    const result = paymentService.create({ email })
    expect(result).toEqual(email)
  })
})

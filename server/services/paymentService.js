module.exports = {
  create: function (payment) {
    console.log('creating new payment', payment)
    return payment.email
  }
}

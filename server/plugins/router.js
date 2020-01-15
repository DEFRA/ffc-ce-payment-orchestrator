const routes = [].concat(
  require('../routes/actionRules'),
  require('../routes/actions'),
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/parcelActions'),
  require('../routes/parcels'),
  require('../routes/payment'),
  require('../routes/paymentCalculation'),
  require('../routes/rules')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}

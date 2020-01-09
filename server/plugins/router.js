const routes = [].concat(
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/parcels'),
  require('../routes/payment'),
  require('../routes/rules'),
  require('../routes/actions')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server, options) => {
      server.route(routes)
    }
  }
}

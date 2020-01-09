const routes = [].concat(
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/payment'),
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

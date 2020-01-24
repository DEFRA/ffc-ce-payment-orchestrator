const actionsService = require('../services/actionsService')

module.exports = {
  method: 'GET',
  path: '/actions',
  options: {
    handler: async (request, h) => {
      const actions = await actionsService.get()
      return h.response({ actions }).code(200)
    }
  }
}

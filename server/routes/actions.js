const actionsService = require('../services/actionsService')

module.exports = {
  method: 'GET',
  path: '/actions',
  options: {
    handler: async (request, h) => {
      const parcelId = request.query.parcelid
      const actions = await actionsService.get(parcelId)
      return h.response(actions).code(200)
    }
  }
}

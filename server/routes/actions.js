const actionsService = require('../services/actionsService')

module.exports = {
  method: 'GET',
  path: '/actions',
  options: {
    handler: async (request, h) => {
      const parcelRef = request.query.parcelref
      console.log('Actions request. Parcel Ref is ', parcelRef)
      const actions = await actionsService.get(parcelRef)
      return h.response({ actions }).code(200)
    }
  }
}

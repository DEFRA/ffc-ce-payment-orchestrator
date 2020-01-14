const validationSchema = require('../schema/parcelActions')
const parcelActionsService = require('../services/parcelActionsService')

module.exports = {
  method: 'GET',
  path: '/parcels/{parcelRef}/actions',
  options: {
    validate: {
      params: validationSchema,
      failAction: async (request, h, error) => {
        console.log('rejected params', request.params)
        return h.response().code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const parcelRef = request.params.parcelRef
      console.log('Actions request. Parcel Ref is', parcelRef)
      const actions = await parcelActionsService.get(parcelRef)
      return h.response({ actions }).code(200)
    }
  }
}

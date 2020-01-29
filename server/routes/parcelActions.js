const validationSchema = require('../schema/parcelActions')
const parcelActionsService = require('../services/parcelActionsService')
const parcelService = require('../services/parcelService')
const actionsService = require('../services/actionsService')
const rulesEngineHelper = require('../rules-engine/helper')

module.exports = [{
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
}, {
  method: 'GET',
  path: '/parcels/{parcelRef}/actions/{actionId}',
  handler: async (request, h) => {
    const { actionId, parcelRef } = request.params
    const parcel = await parcelService.getByRef(parcelRef)
    const action = await actionsService.getByIdWithRules(actionId)
    await rulesEngineHelper.fullRun(action, parcel, { quantity: 1 })

    return h.response({}).code(200)
  }
}]

const actionsService = require('../services/actionsService')
const parcelService = require('../services/parcelService')
const schema = require('../schema/paymentCalculation')
const rulesEngineHelper = require('../rules-engine/helper')

module.exports = [
  {
    method: 'POST',
    path: '/parcels/{parcelRef}/actions/{actionId}/payment-calculation',
    options: {
      validate: {
        payload: schema,
        failAction: async (request, h, error) => {
          console.log('rejected payload', request.payload)
          return h.response().code(400).takeover()
        }
      }
    },
    handler: async (request, h) => {
      const { params: { parcelRef, actionId }, payload: { actionData } } = request
      console.log(`request for payment calculation. parcelRef: ${parcelRef}, actionId: ${actionId}, actionData:`, actionData)

      const landParcel = await parcelService.getByRef(parcelRef)
      const action = await actionsService.getByIdWithRules(actionId)
      const response = await rulesEngineHelper.fullRun(action, landParcel, actionData)

      return h.response(response).code(200)
    }
  }
]

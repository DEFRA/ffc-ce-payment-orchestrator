const actionService = require('../services/actionsService')
const parcelService = require('../services/parcelService')
const paymentCalculationService = require('../services/paymentCalculationService')
const schema = require('../schema/paymentCalculation')

module.exports = [
  {
    method: 'POST',
    path: '/payment-calculation',
    options: {
      validate: {
        payload: schema,
        failAction: async (request, h, error) => {
          console.log('rejected payload', request.payload)
          return h.response().code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const { actions: requestedActions, parcelRef } = request.payload

        const landParcel = await parcelService.getByRef(parcelRef)

        const actions = await Promise.all(
          requestedActions.map(
            async ({ action, options }) => ({
              action: await actionService.getById(action),
              options
            })
          )
        )

        const eligible = await paymentCalculationService.isEligible(landParcel, actions)

        let value
        if (eligible) {
          value = await paymentCalculationService.getValue(landParcel, actions)
        }

        return h.response({ value, eligible }).code(200)
      }
    }
  },
  {
    method: 'POST',
    path: '/parcels/{parcelRef}/actions/{actionId}/payment-calculation',
    handler: async (request, h) => {
      console.log('parcelRef', request.params.parcelRef, 'actionId', request.params.actionId)
      const { params: { parcelRef }, payload: { actions: requestedActions } } = request
      const landParcel = await parcelService.getByRef(parcelRef)

      console.log('requestedActions', requestedActions)

      const actions = await Promise.all(
        requestedActions.map(
          async ({ action, options }) => ({
            action: await actionService.getById(action),
            options
          })
        )
      )

      const response = {
        eligible: await paymentCalculationService.isEligible(landParcel, actions)
      }

      if (response.eligible) {
        response.value = await paymentCalculationService.getValue(landParcel, actions)
      }

      return h.response(response).code(200)
    }
  }
]

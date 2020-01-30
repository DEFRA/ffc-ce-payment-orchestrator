const paramsSchema = require('../schema/actionParams')
const payloadSchema = require('../schema/actionPayload')
const actionsService = require('../services/actionsService')

module.exports = [
  {
    method: 'GET',
    path: '/actions',
    options: {
      handler: async (request, h) => {
        const actions = await actionsService.get()
        return h.response({ actions }).code(200)
      }
    }
  },
  {
    method: 'PUT',
    path: '/actions/{actionID}',
    options: {
      validate: {
        params: paramsSchema,
        payload: payloadSchema,
        failAction: async (request, h, error) => {
          console.log('actions: failed validation')
          console.log(`actions: actionID ${request.params.actionID}`)
          console.log('actions: payload', request.payload)
          return h.response().code(400).takeover()
        }
      },
      handler: async (request, h) => {
        const actionID = request.params.actionID
        const enabled = request.payload.enabled
        console.log(`actionRules: set pre-check on action ${actionID} to ${enabled}`)
        const updatedRule = await actionsService.updatePrecheckEnabled(actionID, enabled)
        return updatedRule ? h.response(updatedRule).code(200) : h.response().code(400)
      }
    }
  }
]

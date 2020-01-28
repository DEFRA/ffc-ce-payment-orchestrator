const paramsSchema = require('../schema/actionRulesParams')
const payloadSchema = require('../schema/actionRulesPayload')
const actionsService = require('../services/actionsService')

module.exports = {
  method: 'PUT',
  path: '/actions/{actionID}/rules/{ruleID}',
  options: {
    validate: {
      params: paramsSchema,
      payload: payloadSchema,
      failAction: async (request, h, error) => {
        console.log('actionRules: failed validation')
        console.log(`actionRules: actionID ${request.params.actionID}, rulesID ${request.params.ruleID}`)
        console.log('actionRules: payload', request.payload)
        return h.response().code(400).takeover()
      }
    },
    handler: async (request, h) => {
      const actionID = request.params.actionID
      const ruleID = request.params.ruleID
      const enabled = request.payload.enabled
      console.log(`actionRules: set rule ${ruleID} on action ${actionID} to ${enabled}`)
      const updatedRule = await actionsService.updateRuleEnabled(actionID, ruleID, enabled)
      return updatedRule ? h.response(updatedRule).code(200) : h.response().code(400)
    }
  }
}

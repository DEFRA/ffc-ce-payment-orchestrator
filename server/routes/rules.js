const rulesService = require('../services/rulesService')

module.exports = {
  method: 'GET',
  path: '/rules',
  options: {
    handler: async (request, h) => {
      const rules = await rulesService.get()
      return h.response({ rules }).code(200)
    }
  }
}

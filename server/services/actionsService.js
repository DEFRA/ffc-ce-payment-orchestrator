const actions = require('../../data/actions.json')
const rulesService = require('./rulesService')

module.exports = {
  get: async function () {
    const rules = await rulesService.get()
    return actions.map(action => {
      action.rules = rules
      return action
    })
  }
}

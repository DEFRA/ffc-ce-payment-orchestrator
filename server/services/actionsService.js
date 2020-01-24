const actions = require('../../data/actions.json')
const rulesService = require('./rulesService')

module.exports = {
  get: async function () {
    const rules = await rulesService.get()
    return actions.map(action => {
      action.rules = rules
      return action
    })
  },
  getConfiguration: async function () {
    const actions = await this.get()
    return actions.map(action => ({
      id: action.id,
      description: action.description,
      rules: action.rules.map(rule => ({
        id: rule.id,
        type: rule.type,
        enabled: rule.enabled,
        description: rule.description,
        facts: rule.facts.map(fact => ({ description: fact.description }))
      }))
    }))
  },
  getByIdWithRules: async function (id) {
    const match = actions.find(action => action.id === id)
    match.rules = await rulesService.get()
    return match
  },
  getById: function (id) {
    const matches = actions.filter(action => action.id === id)
    return matches.length ? matches[0] : null
  }
}

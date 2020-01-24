const actionsData = require('../../data/actions.json')
const rulesService = require('./rulesService')

function ActionService () {
  this._doneInit = false
  this._init = async function () {
    if (this._doneInit) return
    this.allRules = await rulesService.get()
    this.actions = actionsData.map(action => {
      const originalRule = action.rules
      return {
        id: action.id,
        description: action.description,
        rules: Object.assign({}, this.allRules.find(x => x.id === originalRule.id), originalRule)
      }
    })
    this._doneInit = true
  }

  this.get = async function () {
    await this._init()
    return this.actions
  }

  this.getByIdWithRules = async function (id) {
    await this._init()
    const match = this.actions.find(action => action.id === id)
    return match
  }

  this.getById = async function (id) {
    await this._init()
    const matches = this.actions.filter(action => action.id === id)
    return matches.length ? matches[0].map(action => {
      return {
        id: action.id,
        description: action.description
      }
    }) : null
  }
}

module.exports = new ActionService()

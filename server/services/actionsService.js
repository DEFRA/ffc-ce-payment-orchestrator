const actionsData = require('../../data/actions.json')
const rulesService = require('./rulesService')

function ActionsService () {
  this._doneInit = false
  this._init = async function () {
    if (this._doneInit) return
    this.allRules = await rulesService.get()
    this.actions = actionsData.map(action => {
      const { rules, ...retVal } = action
      retVal.rules = action.rules.map(originalRule => ({ ...this.allRules.find(x => x.id === originalRule.id), ...originalRule }))
      return retVal
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
    return match || null
  }

  this.getById = async function (id) {
    await this._init()
    const match = this.actions.find(action => action.id === id)
    if (match) {
      const { rules, ...retVal } = match
      return retVal
    }
    return null
  }

  this.updateRuleEnabled = async function (actionID, ruleID, enabled) {
    await this._init()
    const action = await this.getByIdWithRules(actionID)
    if (action) {
      const rule = action.rules.find(x => x.id === ruleID)
      if (rule) {
        rule.enabled = enabled
        return rule
      }
    }
    return null
  }

  this.updatePrecheckEnabled = async function (actionID, enabled) {
    await this._init()
    const action = await this.getByIdWithRules(actionID)
    if (action) {
      action.precheck = enabled
      return action
    }
    return null
  }
}

module.exports = new ActionsService()

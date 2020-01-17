const Engine = require('json-rules-engine').Engine
const enums = require('./enums')
const Rule = require('json-rules-engine').Rule
let _engine

const _resetEngine = function () {
  _engine = new Engine([], { allowUndefinedFacts: true })
}

_resetEngine()

const rulesEngine = {
  engine: _engine,
  resetEngine: _resetEngine,
  enums,
  Rule,
  enabledEligibilityRules: function (rules) {
    return rules.filter(rule => (('types' in rule) && rule.types.includes(enums.rulesTypes.eligibility) && rule.enabled))
  },
  conditionsFromRules: function (rules) {
    const allRules = rules.reduce((acc, rule) => {
      if (Object.prototype.hasOwnProperty.call(rule, 'conditions')) {
        if (Array.isArray(rule.conditions)) {
          rule.conditions.reduce((notused, condition) => {
            return acc.push(condition)
          }, [])
        }
      }
      return acc
    }, [])
    return allRules
  },
  buildStandardRule: function (conditions, ruleName, eventType) {
    return new Rule({
      conditions: {
        all: conditions
      },
      event: {
        type: eventType
      },
      name: ruleName,
      priority: 5
    })
  },
  buildAcceptedItemsRule: function () {
    return new Rule({
      conditions: {
        all: [{
          fact: enums.ruleRejected,
          operator: 'notEqual',
          value: true
        }]
      },
      event: {
        type: enums.acceptedEventName
      },
      priority: 1,
      name: 'matchAcceptedItems'
    })
  }
}

module.exports = rulesEngine

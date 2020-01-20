const Engine = require('json-rules-engine').Engine
const enums = require('./enums')
const Rule = require('json-rules-engine').Rule
const operators = require('./operators')

const _buildStandardRule = function (conditions, ruleName, eventType) {
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
}

const _setupStandardRule = function (conditions, ruleName, eventType) {
  const rule = _buildStandardRule(conditions, ruleName, eventType)
  this.engine.addRule(rule)
  this.engine.on('success', function (event, almanac, ruleResult) {
    if (event.type === eventType) {
      almanac.addRuntimeFact(enums.ruleRejected, true)
    }
  })
}

function _buildAcceptedItemsRule () {
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

const _setupAcceptedItemsRule = function (funcToCall) {
  const rule = _buildAcceptedItemsRule()
  this.engine.addRule(rule)
  this.engine.on('success', function (event, almanac, ruleResult) {
    if (event.type === enums.acceptedEventName) {
      funcToCall(event, almanac, ruleResult)
    }
  })
}

function RulesEngine () {
  this.engine = {}

  this.resetEngine = function () {
    this.engine = new Engine([], { allowUndefinedFacts: true })
    operators.addAdditionalOperators(this.engine)
  }

  this.enums = enums

  this.Rule = Rule

  this.enabledEligibilityRules = function (rules) {
    return rules.filter(rule => (('types' in rule) && rule.types.includes(enums.rulesTypes.eligibility) && rule.enabled))
  }

  this.conditionsFromRules = function (rules) {
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
  }

  this.setupStandardRule = _setupStandardRule

  this.buildStandardRule = _buildStandardRule

  this.setupAcceptedItemsRule = _setupAcceptedItemsRule

  this.buildAcceptedItemsRule = _buildAcceptedItemsRule

  this.resetEngine()
}

module.exports = new RulesEngine()

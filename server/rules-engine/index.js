const DEBUG = false
const Engine = require('json-rules-engine').Engine
const enums = require('./enums')
const Rule = require('json-rules-engine').Rule
const operators = require('./operators')
const factHandler = require('./factHandler')

const _buildStandardRules = function (conditions, ruleName, eventType) {
  if (DEBUG) console.log('Setting up standard rules with conditions ', conditions)
  return conditions.map(condition => new Rule({
    conditions: {
      all: [condition]
    },
    event: {
      type: eventType
    },
    name: ruleName,
    priority: 5
  }))
}

const _setupStandardRule = function (conditions, ruleName, eventType) {
  const rules = _buildStandardRules(conditions, ruleName, eventType)
  rules.map(rule => {
    this.engine.addRule(rule)
  })
  this.engine.on('success', function (event, almanac, ruleResult) {
    if (event.type === eventType) {
      almanac.addRuntimeFact(enums.ruleRejected, true)
      if (DEBUG) {
        almanac.factValue('ref').then(ref => {
          console.log('Rule passed, rejecting parcel:', ref)
        })
      }
    }
  })
}

const _buildAcceptedItemsRules = function () {
  return [new Rule({
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
  })]
}

const _setupAcceptedItemsRule = function (funcToCall) {
  const rules = _buildAcceptedItemsRules()
  rules.map(rule => {
    this.engine.addRule(rule)
  })
  this.engine.on('success', function (event, almanac, ruleResult) {
    if (event.type === enums.acceptedEventName) {
      if (typeof funcToCall !== 'undefined') {
        funcToCall(event, almanac, ruleResult)
      }
    }
  })
}

const _buildCalculationRule = function (ruleDef) {
  return new Rule(ruleDef)
}

const _setupCalculationRules = function (ruleDefs) {
  ruleDefs.forEach(ruleDef => {
    const rule = _buildCalculationRule(ruleDef)
    this.engine.addRule(rule)
  })
}

const _setupFullRun = function (rulesJson, dataJson, successFunc) {
  const enabledRules = this.enabledRules(rulesJson)
  if (DEBUG) console.log('enabledRules', enabledRules)
  const conditions = this.conditionsFromRules(enabledRules)
  if (DEBUG) console.log(conditions)
  this.setupStandardRule(conditions, 'Standard', 'standard')
  this.setupAcceptedItemsRule(successFunc)
  const calculatedFacts = this.factHandler.getCalculatedFacts(enabledRules)
  const calcRules = this.factHandler.buildCalculationRules(calculatedFacts)
  this.loadCalculationRules(calcRules)
}

const _doFullRun = async function (rulesJson, dataJson, passedFacts, successFunc) {
  const retVal = []
  this.setupFullRun(rulesJson, dataJson, successFunc)
  if (DEBUG) {
    this.engine.rules.map(rule => {
      console.log(rule.toJSON())
    })
  }
  dataJson.map(data => {
    retVal.push(this.runEngine(data, passedFacts))
  })
  const resolvedRetVal = await Promise.all(retVal)
  resolvedRetVal.map(retVal => {
    if (DEBUG) {
      console.log(retVal)
      retVal.almanac.factValue(enums.ruleRejected).then(ruleRejected => {
        retVal.almanac.factValue('ref').then(ref => {
          console.log(ref, ' has rejected value of ', ruleRejected)
        })
      })
    }
  })
  return resolvedRetVal
}

function RulesEngine () {
  this.engine = {}

  this.resetEngine = function () {
    this.engine = new Engine([], { allowUndefinedFacts: true })
    operators.addAdditionalOperators(this.engine)
    if (DEBUG) {
      this.engine.on('failure', (event, almanac, ruleResult) => {
        console.log('failure', JSON.stringify(event), JSON.stringify(ruleResult))
      })
    }
  }

  this.enums = enums

  this.Rule = Rule

  this.enabledEligibilityRules = function (rules) {
    return rules.filter(rule => (('types' in rule) && rule.types.includes(enums.rulesTypes.eligibility) && rule.enabled))
  }

  this.enabledRules = function (rules) {
    return rules.filter(rule => (rule.enabled))
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

  this.runEngine = function (facts, passedFacts) {
    const factsToRun = Object.assign({}, facts, passedFacts)
    return this.engine.run(factsToRun)
  }

  this.setupStandardRule = _setupStandardRule

  this.buildStandardRules = _buildStandardRules

  this.setupAcceptedItemsRule = _setupAcceptedItemsRule

  this.buildAcceptedItemsRules = _buildAcceptedItemsRules

  this.factHandler = factHandler

  this.loadCalculationRules = _setupCalculationRules

  this.setupFullRun = _setupFullRun

  this.doFullRun = _doFullRun

  this.resetEngine()
}

module.exports = new RulesEngine()

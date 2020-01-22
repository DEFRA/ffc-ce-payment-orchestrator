const jp = require('jsonpath')

const sumallRuleHandler = async function (event, almanac) {
  const source = await almanac.factValue(event.params.calculation.sourcefact)
  let totalSum = 0
  const values = jp.query(source, event.params.calculation.path)
  totalSum = values.reduce((acc, value) => {
    acc += value
    return acc
  }, totalSum)
  almanac.addRuntimeFact(event.params.id, totalSum)
}

const sumallRule = function (fact, priority) {
  return {
    conditions: {
      all: [{
        fact: fact.id,
        operator: 'notEqual',
        value: 0
      }]
    },
    event: { type: 'sumall', params: fact },
    onSuccess: sumallRuleHandler,
    priority
  }
}

const subtractRuleHandler = async function (event, almanac) {
  const value1 = await almanac.factValue(event.params.calculation.value1)
  const value2 = await almanac.factValue(event.params.calculation.value2)
  almanac.addRuntimeFact(event.params.id, value1 - value2)
}

const subtractRule = function (fact, priority) {
  return {
    conditions: {
      all: [{
        fact: fact.id,
        operator: 'notEqual',
        value: 0
      }]
    },
    event: { type: 'subtract', params: fact },
    onSuccess: subtractRuleHandler,
    priority
  }
}

const factHandler = {
  factsFromRules: function (rules) {
    const allFacts = rules.reduce((acc, rule) => {
      if (Object.prototype.hasOwnProperty.call(rule, 'facts')) {
        if (Array.isArray(rule.facts)) {
          rule.facts.reduce((notused, fact) => {
            return acc.push(fact)
          }, [])
        }
      }
      return acc
    }, [])
    return allFacts
  },
  getCalculatedFacts: function (rules) {
    const factsToCalculate = []
    const flatFacts = this.factsFromRules(rules)
    const checkFactCalculated = function (factName) {
      if (factName) {
        return flatFacts.some(x => {
          if ((x.id === factName) && (x.calculated === true)) {
            return true
          }
        })
      }
      return false
    }
    rules.forEach(rule => {
      rule.facts.map(x => {
        if (x.calculated) {
          x.dependantFacts = []
          if (checkFactCalculated(x.calculation.value1)) {
            x.dependantFacts.push(x.calculation.value1)
          }
          if (checkFactCalculated(x.calculation.value2)) {
            x.dependantFacts.push(x.calculation.value2)
          }
          if (checkFactCalculated(x.calculation.sourcefact)) {
            x.dependantFacts.push(x.calculation.sourcefact)
          }
          factsToCalculate.push(x)
        }
      })
    })
    // Now sort factsToCalculate into the order the facts need to be calculated
    const orderedFactList = factsToCalculate.sort((x, y) => {
      if (x.dependantFacts.length === 0) {
        if (y.dependantFacts.length === 0) {
          // If they both have no dependant facts, then they're equal.
          return 0
        } else {
          // If y has dependantFacts, then x should come first, so return -1
          return -1
        }
      } else {
        if (y.dependantFacts.length === 0) {
          // If y has no dependant fact, but x does, then x should come after y, so return 1
          return 1
        } else {
          // They both have dependant facts, so do those calculations
          if (y.dependantFacts.includes(x.id)) {
            // y depends on x, so x needs to come first
            return -1
          } else {
            if (x.dependantFacts.includes(y.id)) {
              // x depends on y, so y should come first
              return 1
            } else {
              // Neither x or y depend on each other, so they're equal in priority
              return 0
            }
          }
        }
      }
    })
    return orderedFactList
  },
  buildCalculationRules: function (factList) {
    let priority = 20 + factList.length
    const returnRules = []
    // Array is in priority order, so process it in that order
    for (let i = 0; i < factList.length; ++i) {
      const fact = factList[i]
      if (fact.calculated) {
        switch (fact.calculation.operator) {
          case 'sumall':
            returnRules.push(sumallRule(fact, priority--))
            break
          case 'subtract':
            returnRules.push(subtractRule(fact, priority--))
            break
          default:
            console.log('Unknown operator: ', fact.calculation.operator)
        }
      }
    }
    return returnRules
  }
}

module.exports = factHandler

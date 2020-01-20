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
    console.log(orderedFactList)
    return orderedFactList
  }
}

module.exports = factHandler

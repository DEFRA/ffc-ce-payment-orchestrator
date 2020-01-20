const moment = require('moment')

const additionalOperators = {
  addAdditionalOperators: function (engine) {
    engine.addOperator('lessThan5Years', (factValue, jsonValue) => {
      if (factValue) {
        const toCompare = moment(jsonValue)
        toCompare.subtract(5, 'years')
        const compareDate = (fromValue) => {
          const fromMoment = moment(fromValue)
          const compareResult = toCompare.isBefore(fromMoment)
          return compareResult
        }
        if (Array.isArray(factValue)) {
          let retResult = false
          factValue.reduce((reduceResult, current) => {
            if (compareDate(current)) {
              retResult = true
            }
          }, false)
          return retResult
        } else {
          return compareDate(factValue)
        }
      }
      return false
    })
  }
}

module.exports = additionalOperators

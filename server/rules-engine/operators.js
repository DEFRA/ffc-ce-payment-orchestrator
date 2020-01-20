const moment = require('moment')

const additionalOperators = {
  addAdditionalOperators: function (engine) {
    engine.addOperator('lessThan5Years', (factValue, jsonValue) => {
      const toCompare = moment(jsonValue)
      const fromValue = moment(factValue)
      fromValue.add(5, 'years')
      return (toCompare.isBefore(fromValue))
    })
  }
}

module.exports = additionalOperators

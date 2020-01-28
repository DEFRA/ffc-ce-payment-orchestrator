const rules = require('../../data/rules.json')

module.exports = {
  get: async function () {
    return rules
  }
}

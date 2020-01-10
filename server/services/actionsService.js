const actionsList = require('../../data/actions.json')

module.exports = {
  get: async function (parcelRef) {
    return {
      actions: actionsList
    }
  }
}

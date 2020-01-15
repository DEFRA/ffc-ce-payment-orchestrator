const fencingAction = require('../../server/actions/fencing')

module.exports = {
  getValue: function (landParcel, actions) {
    return actions
      .map(({ options }) => ({ action: fencingAction, options }))
      .map(({ action, options }) => action.calculateValue(landParcel, options))
      .reduce((total, actionValue) => total + actionValue, 0)
  },

  isEligible: function (landParcel, actions) {
    return actions
      .map(({ options }) => ({ action: fencingAction, options }))
      .map(({ action, options }) => action.isEligible(landParcel, options))
      .reduce((result, actionPermitted) => result && actionPermitted, true)
  }
}

const config = require('../config')

module.exports = {
  calculateValue: function (landParcel, options) {
    return options.quantity * config.actions.fencingPricePerMetre
  },

  isEligible: function (landParcel, options) {
    return options.quantity > 0 // For initial prototype, eligibility criteria as per https://eaflood.atlassian.net/browse/FCEP-48
  }
}

module.exports = {
  calculateValue: function(landParcel, options) {
    return 99 // For initial prototype, fixed value as per https://eaflood.atlassian.net/browse/FCEP-48
  },

  isEligible: function(landParcel, options) {
    return options.quantity > 0 // For initial prototype, eligibility criteria as per https://eaflood.atlassian.net/browse/FCEP-48
  }
}

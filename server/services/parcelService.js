const parcels = require('../../data/parcels.json')

module.exports = {
  get: function () {
    return parcels
  },
  getByRef: function (parcelRef) {
    const matches = parcels.filter(parcel => parcel.parcelRef === parcelRef)
    return matches.length ? matches[0] : null
  }
}

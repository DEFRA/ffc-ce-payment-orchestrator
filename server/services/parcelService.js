const parcels = require('../../data/parcels.json')

module.exports = {
  get: function () {
    return parcels.map(parcel => ({ ref: parcel.parcelRef }))
  },
  getByRef: function (parcelRef) {
    return parcels.filter(parcel => parcel.parcelRef === parcelRef)
  }
}

const parcels = require('../../data/mock-parcel-data.json')

module.exports = {
  get: function () {
    return parcels.map(parcel => ({ ref: parcel.parcelRef }))
  }
}

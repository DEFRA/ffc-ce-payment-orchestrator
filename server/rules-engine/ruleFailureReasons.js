const reasons = Object.freeze({
  cultivated: 'Parcel isn\'t cultivated land',
  hasReintroducedGrazing: 'Parcel hasn\'t reintroduced grazing',
  inWaterPollutionZone: 'Parcel isn\'t in water pollution reduction zone',
  noActionsInTimePeriod: 'Parcel has previous actions invalidating new claims',
  notSSSI: 'Parcel is an area of special scientific interest'
})

module.exports = {
  reasons
}

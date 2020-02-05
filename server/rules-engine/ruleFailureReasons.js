const reasons = Object.freeze({
  withinArea: 'Area is greater than defined parcel area',
  cultivated: 'Parcel isn\'t cultivated',
  hasReintroducedGrazing: 'Parcel hasn\'t reintroduced grazing',
  inWaterPollutionZone: 'Parcel is in water pollution zone',
  noActionsInTimePeriod: 'Parcel has previous actions invalidating new claims',
  notSSSI: 'Parcel is not an area of special scientific interest',
  perimeter: 'Proposed area is larger than the Total Parcel Area minus the Pond area of the Parcel Features',
  pondlessArea: 'Proposed area contains ponds',
  tolerancePerimeter: 'Proposed value isn\'t within tolerance'
})

module.exports = {
  reasons
}

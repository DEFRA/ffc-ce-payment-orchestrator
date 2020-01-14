const Joi = require('@hapi/joi')

module.exports = Joi.object({
  // Match known Parcel Ref format: start with two alphabetical characters
  // followed by eight numeric characters
  parcelRef: Joi.string().pattern(new RegExp('^[A-Za-z]{2}[0-9]{8}$')).required()
})

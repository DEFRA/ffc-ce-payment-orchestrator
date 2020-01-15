const Joi = require('@hapi/joi')

module.exports = Joi.object({
  parcelRef: Joi.string().required(),
  actions: Joi.array()
})

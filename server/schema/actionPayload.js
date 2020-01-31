const Joi = require('@hapi/joi')

module.exports = Joi.object({
  enabled: Joi.boolean().required()
})

const Joi = require('@hapi/joi')

module.exports = Joi.object({
  actionData: Joi.object({
    quantity: Joi.number().required()
  })
})

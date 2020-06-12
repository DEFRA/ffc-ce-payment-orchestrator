const joi = require('@hapi/joi')

// Define config schema
const schema = joi.object({
  port: joi.number().default(3002),
  env: joi.string().valid('development', 'test', 'production').default('development')
})

// Build config
const config = {
  port: process.env.PORT,
  env: process.env.NODE_ENV
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

// Use the joi validated value
const value = result.value

// Add some helper props
value.isDev = value.env === 'development'
value.isProd = value.env === 'production'

console.log(JSON.stringify(process.env))
console.log(`QQQ1: ${process.env.QQQ1}`)
console.log(`QQQ2: ${process.env.QQQ2}`)
console.log(`POSTGRES USERNAME: ${process.env.POSTGRES_USERNAME}`)
console.log(`POSTGRES USERNAM: ${process.env.POSTGRES_USERNAM}`)
console.log(`POSTGRES PASSWORD: ${process.env.POSTGRES_PASSWORD}`)

module.exports = value

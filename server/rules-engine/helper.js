const rulesEngine = require('../../server/rules-engine')

async function fullRun (rules, parcel, options) {
  let success = false
  rulesEngine.resetEngine()
  await rulesEngine.doFullRun(rules, [parcel], options, () => { success = true })
  return success
}

module.exports = {
  fullRun
}


module.exports = {
  doFullRun: (rulesJson, dataJson, passedFacts, successFunc) => {
    successFunc()
    return Promise.resolve()
  }
}

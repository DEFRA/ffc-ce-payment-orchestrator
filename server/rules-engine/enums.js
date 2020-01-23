const rulesTypes = Object.freeze({
  eligibility: 'eligibility',
  fact: 'fact'
})
const ruleAccepted = '_rule_accepted'
const ruleRejected = '_rule_rejected'
const acceptedEventName = '_accepted_event'
const rejectedFactAdder = '_rejected_fact_adder'

module.exports =
{
  rulesTypes,
  ruleAccepted,
  ruleRejected,
  acceptedEventName,
  rejectedFactAdder
}

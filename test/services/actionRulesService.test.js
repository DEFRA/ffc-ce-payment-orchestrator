const actionRulesService = require('../../server/services/actionRulesService')
const actionID = 'FG1'
const ruleID = 3
const enabled = false

describe('actionRulesService', () => {
  test('action rules service returns an object', async () => {
    const rule = await actionRulesService.update(actionID, ruleID, enabled)
    expect((rule instanceof Object)).toEqual(true)
  })

  test('action rules service returns a rule object containing given id and enabled state', async () => {
    const rule = await actionRulesService.update(actionID, ruleID, enabled)
    expect(rule).toEqual(
      expect.objectContaining({
        id: ruleID,
        enabled: enabled
      })
    )
  })
})

const actionRulesService = require('../../server/services/actionRulesService')
const actionsService = require('../../server/services/actionsService')
const actionID = 'FG1'
const ruleID1 = 3
const ruleID2 = 5
const enabled = false

describe('actionRulesService', () => {
  test('action rules service returns an object', async () => {
    const rule = await actionRulesService.update(actionID, ruleID1, enabled)
    expect((rule instanceof Object)).toEqual(true)
  })

  test('action rules service returns a rule object containing given id and enabled state', async () => {
    const rule = await actionRulesService.update(actionID, ruleID1, enabled)
    expect(rule).toEqual(
      expect.objectContaining({
        id: ruleID1,
        enabled: enabled
      })
    )
  })

  test('action rules service changes to rule enabled persist on multiple calls', async () => {
    await actionRulesService.update(actionID, ruleID1, enabled)
    await actionRulesService.update(actionID, ruleID2, enabled)
    const actions = await actionsService.get()
    const rules = actions.find(action => action.id === actionID).rules

    expect(rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: ruleID1, enabled: enabled }),
        expect.objectContaining({ id: ruleID2, enabled: enabled })
      ])
    )
  })
})

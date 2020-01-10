
const rulesService = require('../../server/services/rulesService')
describe('rulesService', () => {
  test('rules service returns an array', async () => {
    const rules = await rulesService.get()
    expect(Array.isArray(rules)).toEqual(true)
  })

  test('rules service returns an array where the first element has an id of 1', async () => {
    const rules = await rulesService.get()
    expect(rules[0]).toMatchObject({ id: 1 })
  })
})

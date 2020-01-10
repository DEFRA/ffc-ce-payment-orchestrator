
const rulesService = require('../../server/services/rulesService')
describe('rulesService', () => {
  test('rules service returns a rules object containing an array', async () => {
    expect.assertions(1)
    const rules = await rulesService.get()
    expect(Array.isArray(rules)).toEqual(true)
  })

  test('rules service object contains an array where the first element has an id of 1', async () => {
    expect.assertions(1)
    const rules = await rulesService.get()
    expect(rules[0]).toMatchObject({ id: 1 })
  })
})

const rulesService = require('../../server/services/rulesService')

jest.mock(
  '../../data/rules.json',
  () => ([
    {
      id: 1,
      description: 'Mock rule 1',
      enabled: true,
      facts: []
    },
    {
      id: 2,
      description: 'Mock rule 2',
      enabled: false,
      facts: []
    },
    {
      id: 3,
      description: 'Mock rule 3',
      enabled: true,
      facts: []
    }
  ])
)

describe('rulesService', () => {
  afterAll(() => {
    jest.unmock('../../data/rules.json')
  })

  test('get returns an array', async () => {
    const rules = await rulesService.get()
    expect(Array.isArray(rules)).toEqual(true)
  })

  test('get returns an array where the first element has an id of 1', async () => {
    const rules = await rulesService.get()
    expect(rules[0]).toMatchObject({ id: 1 })
  })
})

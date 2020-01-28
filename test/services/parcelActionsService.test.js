const mockParcelsToReturn = [{
  ref: 'SS12345678',
  SSSI: false,
  totalPerimeter: 45,
  perimeterFeatures: [],
  previousActions: []
},
{
  ref: 'XX12345678',
  SSSI: true,
  totalPerimeter: 45,
  perimeterFeatures: [],
  previousActions: []
}]

jest.mock('../../server/services/parcelService', () => {
  return {
    getByRef: jest.fn((parcelRef) => {
      return mockParcelsToReturn.find(x => x.ref === parcelRef)
    })
  }
})

jest.mock('../../server/services/actionsService', () => {
  return {
    get: jest.fn().mockResolvedValue([{
      id: 'TE1',
      description: 'Testing',
      rules: [
        {
          id: 5,
          type: 'eligibility',
          description: 'Parcel within SSSI',
          enabled: true,
          facts: [
            {
              id: 'SSSI',
              description: 'Parcel in SSSI area'
            }
          ],
          conditions: [{
            fact: 'SSSI',
            operator: 'equal',
            value: true
          }]
        }]
    },
    {
      id: 'TE2',
      description: 'Testing',
      rules: []
    }])
  }
})

const parcelActionsService = require('../../server/services/parcelActionsService')
const SSSIparcelRef = 'SS12345678'
const nonSSSIparcelRef = 'XX12345678'

describe('parcelActionService', () => {
  test('parcel actions service returns an array', async () => {
    const actions = await parcelActionsService.get(SSSIparcelRef)
    expect(Array.isArray(actions)).toEqual(true)
  })

  test('returns all actions if parcel is eligible for all actions', async () => {
    const actions = await parcelActionsService.get(SSSIparcelRef)
    expect(actions).toEqual([
      { id: 'TE1', description: 'Testing' },
      { id: 'TE2', description: 'Testing' }
    ])
  })

  test('returns only eligible actions if the parcel is eligible for some actions', async () => {
    const actions = await parcelActionsService.get(nonSSSIparcelRef)
    expect(actions).toEqual([
      { id: 'TE2', description: 'Testing' }])
  })
})

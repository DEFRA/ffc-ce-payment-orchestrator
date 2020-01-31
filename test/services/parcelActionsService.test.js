const mockParcelsToReturn = [{
  ref: 'SS12345678',
  sssi: false,
  totalArea: 90,
  totalPerimeter: 45,
  areaFeatures: [],
  perimeterFeatures: [],
  previousActions: []
},
{
  ref: 'XX12345678',
  sssi: true,
  totalArea: 90,
  totalPerimeter: 45,
  areaFeatures: [],
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
              id: 'sssi',
              description: 'Parcel in SSSI area'
            }
          ],
          conditions: [{
            fact: 'sssi',
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
const sssiParcelRef = 'SS12345678'
const nonSSSIParcelRef = 'XX12345678'

describe('parcelActionService', () => {
  test('parcel actions service returns an array', async () => {
    const actions = await parcelActionsService.get(sssiParcelRef)
    expect(Array.isArray(actions)).toEqual(true)
  })

  test('returns all actions if parcel is eligible for all actions', async () => {
    const actions = await parcelActionsService.get(sssiParcelRef)
    expect(actions).toEqual([
      { id: 'TE1', description: 'Testing' },
      { id: 'TE2', description: 'Testing' }
    ])
  })

  test('returns only eligible actions if the parcel is eligible for some actions', async () => {
    const actions = await parcelActionsService.get(nonSSSIParcelRef)
    expect(actions).toEqual([
      { id: 'TE2', description: 'Testing' }])
  })
})

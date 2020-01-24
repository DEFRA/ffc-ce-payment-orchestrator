const mockParcelsToReturn = [{
  ref: 'SS12345678',
  SSSI: false
},
{
  ref: 'XX12345678',
  SSSI: true
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
    get: jest.fn(() => {
      return [{
        id: 'TE1',
        description: 'Testing',
        rules: [
          {
            id: 5,
            type: 'eligibility',
            types: ['eligibility'],
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
        rules: [
          {
            id: 6,
            type: 'eligibility',
            types: ['eligibility'],
            description: 'Parcel not within SSSI',
            enabled: true,
            facts: [
              {
                id: 'SSSI',
                description: 'Parcel in SSSI area'
              }
            ],
            conditions: [{
              fact: 'SSSI',
              operator: 'notEqual',
              value: true
            }]
          }]
      }]
    })
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

  test('for an SSSI disabled parcel actions service returns an array where the first element has an id of TE1', async () => {
    const actions = await parcelActionsService.get(SSSIparcelRef)
    expect(actions[0]).toMatchObject({
      id: 'TE1',
      description: 'Testing'
    })
  })

  test('for an SSSI enable parcel actions service returns an array where the first element has an id of TE2', async () => {
    const actions = await parcelActionsService.get(nonSSSIparcelRef)
    expect(actions[0]).toMatchObject({
      id: 'TE2',
      description: 'Testing'
    })
  })
})

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
const actionsService = require('../../server/services/actionsService')
jest.mock('../../server/services/actionsService')
const rulesEngineService = require('../../server/services/rulesEngineService')
jest.mock('../../server/services/rulesEngineService')

const parcelActionsService = require('../../server/services/parcelActionsService')

describe('parcelActionService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    rulesEngineService.doEligibilityRun.mockImplementation((r, p, e, successCallback) => {
      successCallback()
    })
  })

  test('parcel actions returns each eligible action', async () => {
    const testCases = [
      {
        actions: [{ id: 'action-1', rules: [] }],
        eligible: ['action-1']
      },
      {
        actions: [
          { id: 'action-2', rules: [] },
          { id: 'action-3', rules: [] },
          { id: 'action-4', rules: [] }
        ],
        eligible: ['action-2', 'action-4']
      },
      {
        actions: [
          { id: 'action-5', rules: [] },
          { id: 'action-6', rules: [] },
          { id: 'action-7', rules: [] }
        ],
        eligible: ['action-6']
      }
    ]
    for (const testCase of testCases) {
      actionsService.get.mockResolvedValue(testCase.actions)
      rulesEngineService.doEligibilityRun.mockImplementation((r, p, e, callback) => {
        const actionIndex = rulesEngineService.doEligibilityRun.mock.calls.length
        if (testCase.eligible.includes(`action-${actionIndex}`)) {
          callback()
        }
        return Promise.resolve()
      })
      const eligibleActions = await parcelActionsService.get('AB123456')
      const expectedActions = testCase.actions.filter(a => testCase.eligible.includes(a.id)).map(a => ({ id: a.id }))
      expect(eligibleActions).toEqual(expectedActions)
    }
  })
})

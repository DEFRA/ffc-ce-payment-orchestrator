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
const mockRuleFailureReasons = {
  sampleRule: 'Sample reason'
}

jest.mock('../../server/services/parcelService', () => {
  return {
    getByRef: jest.fn((parcelRef) => {
      return mockParcelsToReturn.find(x => x.ref === parcelRef)
    })
  }
})
const actionsService = require('../../server/services/actionsService')
jest.mock('../../server/services/actionsService')
const rulesEngineHelper = require('../../server/rules-engine/helper')
jest.mock('../../server/rules-engine/helper')
jest.mock('../../server/rules-engine/eligibilityRuleFailureReasons', () => ({ reasons: mockRuleFailureReasons }))

const parcelActionsService = require('../../server/services/parcelActionsService')

describe('parcelActionService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    rulesEngineHelper.eligibilityRun.mockImplementation((action, parcelData, options) => {
      return Promise.resolve({ failingRules: [], actionPassed: true })
    })
  })

  test('parcel actions returns each eligible action', async () => {
    const testCases = [
      {
        actions: [buildSampleAction('action-1')],
        eligible: ['action-1']
      },
      {
        actions: [
          buildSampleAction('action-2'),
          buildSampleAction('action-3'),
          buildSampleAction('action-4')
        ],
        eligible: ['action-2', 'action-4']
      },
      {
        actions: [
          buildSampleAction('action-5'),
          buildSampleAction('action-6'),
          buildSampleAction('action-7')
        ],
        eligible: ['action-6']
      }
    ]
    for (const testCase of testCases) {
      actionsService.get.mockResolvedValue(testCase.actions)
      rulesEngineHelper.eligibilityRun.mockImplementation((action, parcelData, options) => {
        const actionIndex = rulesEngineHelper.eligibilityRun.mock.calls.length
        const failingRules = []
        let actionPassed = false
        if (testCase.eligible.includes(`action-${actionIndex}`)) {
          actionPassed = true
        } else {
          failingRules.push('sampleRule')
        }
        return Promise.resolve({ actionPassed, failingRules })
      })
      const actions = await parcelActionsService.get('AB123456')
      const expectedActions = testCase.actions.map(a => buildExpectedResponse(a, testCase.eligible.includes(a.id)))
      expect(actions).toEqual(expect.arrayContaining(expectedActions))
    }
  })

  const buildExpectedResponse = (action, eligible) => {
    const resp = {
      id: action.id,
      description: action.description,
      eligible
    }
    if (!eligible) {
      resp.reason = mockRuleFailureReasons.sampleRule
    }
    return resp
  }

  const buildSampleAction = tag => ({
    id: tag,
    description: tag,
    rules: []
  })
})

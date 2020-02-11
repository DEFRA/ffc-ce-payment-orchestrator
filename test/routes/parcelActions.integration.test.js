const createServer = require('../../server/createServer')
let server
const actions = require('../../data/actions')

async function setUpServer () {
  const createServer = require('../../server/createServer')
  server = await createServer()
  await server.initialize()
}

describe('GET /parcels/{parcelRef}/actions', () => {
  let server

  const generateRequestOptions = (
    parcelRef
  ) => ({
    method: 'GET',
    url: `/parcels/${parcelRef}/actions`
  })

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('Each parcel returns expected eligible actions', async () => {
    const testCases = [
      { parcelRef: 'SD74445738', expectedActions: ['FG1', 'SW6', 'LV7'] },
      { parcelRef: 'SD75492628', expectedActions: ['SW6', 'LV7'] },
      { parcelRef: 'SD78379604', expectedActions: ['LV7'] },
      { parcelRef: 'SD81437506', expectedActions: ['FG1'] },
      { parcelRef: 'SD81525709', expectedActions: ['FG1', 'SW6'] }
    ]

    for (const testCase of testCases) {
      const response = await server.inject(generateRequestOptions(testCase.parcelRef))
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      console.log(testCase.parcelRef)
      expect(payload.actions.filter(a => a.eligible).map(a => a.id)).toEqual(
        testCase.expectedActions
      )
    }
  })
})

describe('GET /parcels/{parcelRef}/actions/{actionId}', () => {
  const generateRequestOptions = (
    parcelRef,
    actionId
  ) => ({
    method: 'GET',
    url: `/parcels/${parcelRef}/actions/${actionId}`
  })

  beforeEach(async () => {
    jest.resetModules()
  })
  afterEach(async () => {
    await server.stop()
  })

  describe('action FG1: Fencing', () => {
    // const actionId = 'FG1'
    describe('with total perimeter, previous actions and SSSI rules', () => {
      // const parcelRef = 'SD74445738'
      beforeEach(async () => {
        jest.mock(
          '../../data/actions.json',
          () => [
            {
              id: 'FG1',
              description: 'Fencing',
              input: {
                unit: 'metres',
                description: 'fence length',
                lowerbound: 2
              },
              precheck: true,
              rate: 4,
              rules: [
                { id: 2, enabled: true, type: 'prevalidation' },
                { id: 4, enabled: true, type: 'prevalidation' },
                { id: 5, enabled: true, type: 'prevalidation' }
              ]
            }
          ]
        )
        jest.mock(
          '../../data/parcels.json',
          () => [
            {
              ref: 'SD74445738',
              description: 'Fishponds',
              totalPerimeter: 925.2,
              totalArea: 1.856,
              perimeterFeatures: [
                {
                  type: 'barn',
                  length: 23.3
                },
                {
                  type: 'hedgerow',
                  length: 162.6
                }
              ],
              areaFeatures: [],
              previousActions: [],
              sssi: false,
              landCoverClass: 110,
              hasReintroducedGrazing: true,
              inWaterPollutionZone: true
            }
          ]
        )
        await setUpServer()
      })
      test('parcels have correct parameters for action FG1', async () => {
        const action = actions.find(a => a.id === 'FG1')
        const testCases = [
          { parcelRef: 'SD74445738', expectedUpperbound: 739.3 }
          // { parcelRef: 'SD75492628', expectedUpperbound: undefined },
          // { parcelRef: 'SD78379604', expectedUpperbound: undefined },
          // { parcelRef: 'SD81437506', expectedUpperbound: 431.6 },
          // { parcelRef: 'SD81525709', expectedUpperbound: 540.4 }
        ]
        await testOutputIsCorrect(action, testCases)
      })
    })
  })

  test.skip('parcels have correct parameters for action SW6', async () => {
    const action = actions.find(a => a.id === 'SW6')
    const testCases = [
      { parcelRef: 'SD74445738', expectedUpperbound: 1.56 },
      { parcelRef: 'SD75492628', expectedUpperbound: 3.19 },
      { parcelRef: 'SD78379604', expectedUpperbound: undefined },
      { parcelRef: 'SD81437506', expectedUpperbound: undefined },
      { parcelRef: 'SD81525709', expectedUpperbound: 1.49 }
    ]
    await testOutputIsCorrect(action, testCases)
  })

  const testOutputIsCorrect = async (action, testCases) => {
    for (const testCase of testCases) {
      const response = await server.inject(generateRequestOptions(testCase.parcelRef, action.id))
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      expect(payload).toEqual(
        expect.objectContaining({
          id: action.id,
          description: action.description,
          input: expect.objectContaining(generateExpectedInput(action, testCase.expectedUpperbound))
        })
      )
    }
  }

  const generateExpectedInput = (action, upperbound) => {
    const expectedInput = {
      ...action.input
    }
    if (upperbound) {
      expectedInput.upperbound = upperbound
    }
    return expectedInput
  }
})

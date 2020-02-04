const createServer = require('../../server/createServer')
const actions = require('../../data/actions')

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

  test('Each parcel returns expected actions', async () => {
    const testCases = [
      { parcelRef: 'SD74445738', expectedActions: ['FG1', 'SW6'] },
      { parcelRef: 'SD75492628', expectedActions: ['SW6'] },
      { parcelRef: 'SD78379604', expectedActions: [] },
      { parcelRef: 'SD81437506', expectedActions: ['FG1', 'SW6'] },
      { parcelRef: 'SD81525709', expectedActions: ['FG1', 'SW6'] }
    ]

    for (const testCase of testCases) {
      const response = await server.inject(generateRequestOptions(testCase.parcelRef))
      const payload = JSON.parse(response.payload)
      expect(response.statusCode).toBe(200)
      console.log(testCase.parcelRef, testCase.expectedActions, payload.actions)
      expect(payload.actions.map(a => a.id)).toEqual(
        testCase.expectedActions
      )
    }
  })
})

describe('GET /parcels/{parcelRef}/actions/{actionId}', () => {
  let server

  const generateRequestOptions = (
    parcelRef,
    actionId
  ) => ({
    method: 'GET',
    url: `/parcels/${parcelRef}/actions/${actionId}`
  })

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  test('parcels have correct parameters for action FG1', async () => {
    const action = actions.find(a => a.id === 'FG1')
    const testCases = [
      { parcelRef: 'SD74445738', expectedUpperbound: 739.3 },
      { parcelRef: 'SD75492628', expectedUpperbound: undefined },
      { parcelRef: 'SD78379604', expectedUpperbound: undefined },
      { parcelRef: 'SD81437506', expectedUpperbound: 431.6 },
      { parcelRef: 'SD81525709', expectedUpperbound: 540.4 }
    ]
    await testOutputIsCorrect(action, testCases)
  })

  test('parcels have correct parameters for action SW6', async () => {
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

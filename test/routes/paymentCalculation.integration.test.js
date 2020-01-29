let server

const perimeterOfParcelSD74445738 = 925.2
const adjustedPerimeterOfParcelSD74445738 = perimeterOfParcelSD74445738 - (23.3 + 162.6)

const areaOfParcelSD74445738 = 1.856
const adjustedAreaOfParcelSD74445738 = areaOfParcelSD74445738 - 0.3

async function setUpServer () {
  const createServer = require('../../server/createServer')
  server = await createServer()
  await server.initialize()
}

describe('POST /parcels/{parcelRef/actions/{actionId}/payment-calculation', () => {
  const generateRequestOptions = (
    parcelRef,
    actionId,
    actionData
  ) => ({
    method: 'POST',
    url: `/parcels/${parcelRef}/actions/${actionId}/payment-calculation`,
    payload: {
      actionData
    }
  })

  beforeEach(async () => {
    jest.resetModules()
  })
  afterEach(async () => {
    await server.stop()
  })

  describe('action FG1: Fencing', () => {
    const actionId = 'FG1'

    describe('with total perimeter, previous actions and SSSI rules', () => {
      const parcelRef = 'SD74445738'

      beforeEach(async () => {
        jest.mock(
          '../../data/actions.json',
          () => [
            {
              id: 'FG1',
              description: 'Fencing',
              rate: 4,
              rules: [
                { id: 1, enabled: true },
                { id: 4, enabled: true },
                { id: 5, enabled: true }
              ]
            }
          ]
        )
        await setUpServer()
      })

      test('parcel is eligible if requested length is less than total perimeter, there are no previous actions and it is not in a SSSI', async () => {
        const quantity = perimeterOfParcelSD74445738
        const response = await server.inject(generateRequestOptions(parcelRef, actionId, { quantity }))
        const payload = JSON.parse(response.payload)
        expect(response.statusCode).toBe(200)
        expect(payload).toEqual(
          expect.objectContaining({
            eligible: true,
            value: quantity * 4
          })
        )
      })

      test('parcel is ineligible if requested length is more than parcel perimeter', async () => {
        const quantity = perimeterOfParcelSD74445738 + 0.1
        const response = await server.inject(generateRequestOptions(parcelRef, actionId, { quantity }))
        const payload = JSON.parse(response.payload)
        expect(response.statusCode).toBe(200)
        expect(payload).toEqual(
          expect.objectContaining({
            eligible: false
          })
        )
      })
    })

    describe('with adjusted perimeter rule', () => {
      const parcelId = 'SD74445738'

      beforeEach(async () => {
        jest.mock(
          '../../data/actions.json',
          () => [
            {
              id: 'FG1',
              description: 'Fencing',
              rate: 4,
              rules: [
                { id: 2, enabled: true }
              ]
            }
          ]
        )
        await setUpServer()
      })

      test('parcel is eligible if requested length is less than adjusted perimeter', async () => {
        const quantity = adjustedPerimeterOfParcelSD74445738 - 0.1
        const response = await server.inject(generateRequestOptions(parcelId, actionId, { quantity }))
        const payload = JSON.parse(response.payload)
        expect(response.statusCode).toBe(200)
        expect(payload).toEqual(
          expect.objectContaining({
            eligible: true,
            value: quantity * 4
          })
        )
      })

      test('parcel is ineligible if requested length is more than adjusted perimeter', async () => {
        const quantity = adjustedPerimeterOfParcelSD74445738 + 0.1
        const response = await server.inject(generateRequestOptions(parcelId, actionId, { quantity }))
        const payload = JSON.parse(response.payload)
        expect(response.statusCode).toBe(200)
        expect(payload).toEqual(
          expect.objectContaining({
            eligible: false
          })
        )
      })
    })

    describe('with previous actions rule', () => {
      const parcelId = 'SD75492628'

      beforeEach(async () => {
        jest.mock(
          '../../data/actions.json',
          () => [
            {
              id: 'FG1',
              description: 'Fencing',
              rate: 4,
              rules: [
                { id: 4, enabled: true }
              ]
            }
          ]
        )
        await setUpServer()
      })

      test('parcel is ineligible if it has a previous action', async () => {
        const response = await server.inject(generateRequestOptions(parcelId, actionId, { quantity: 10 }))
        const payload = JSON.parse(response.payload)
        expect(response.statusCode).toBe(200)
        expect(payload).toEqual(
          expect.objectContaining({
            eligible: false
          })
        )
      })
    })

    describe('with SSSI rule enabled', () => {
      const parcelId = 'SD78379604'

      beforeEach(async () => {
        jest.mock(
          '../../data/actions.json',
          () => [
            {
              id: 'FG1',
              description: 'Fencing',
              rate: 4,
              rules: [
                { id: 5, enabled: true }
              ]
            }
          ]
        )
        await setUpServer()
      })

      test('parcel is in eligible if it is in a SSSI, with SSSI rule enabled', async () => {
        const response = await server.inject(generateRequestOptions(parcelId, actionId, { quantity: 10 }))
        const payload = JSON.parse(response.payload)
        expect(response.statusCode).toBe(200)
        expect(payload).toEqual(
          expect.objectContaining({
            eligible: false
          })
        )
      })
    })
  })

  describe('action SW6: Winter cover crops', () => {
    const actionId = 'SW6'

    describe('with total parcel area rule', () => {
      const parcelId = 'SD74445738'

      beforeEach(async () => {
        jest.mock(
          '../../data/actions.json',
          () => [
            {
              id: 'SW6',
              description: 'Winter cover crops',
              rate: 114,
              rules: [
                { id: 7, enabled: true }
              ]
            }
          ]
        )
        await setUpServer()
      })

      test('parcel is eligible if requested area is less than parcel area', async () => {
        const quantity = areaOfParcelSD74445738 - 0.1
        const response = await server.inject(generateRequestOptions(parcelId, actionId, { quantity }))
        const payload = JSON.parse(response.payload)
        expect(response.statusCode).toBe(200)
        expect(payload).toEqual(
          expect.objectContaining({
            eligible: true,
            value: quantity * 114
          })
        )
      })

      test('parcel is ineligible if requested area is greater than parcel area', async () => {
        const quantity = areaOfParcelSD74445738 + 0.1
        const response = await server.inject(generateRequestOptions(parcelId, actionId, { quantity }))
        const payload = JSON.parse(response.payload)
        expect(response.statusCode).toBe(200)
        expect(payload).toEqual(
          expect.objectContaining({
            eligible: false
          })
        )
      })
    })

    describe('with adjusted parcel area rule enabled', () => {
      const parcelId = 'SD74445738'

      beforeEach(async () => {
        jest.mock(
          '../../data/actions.json',
          () => [
            {
              id: 'SW6',
              description: 'Winter cover crops',
              rate: 114,
              rules: [
                { id: 6, enabled: true }
              ]
            }
          ]
        )
        await setUpServer()
      })

      test('parcel is eligible if requested area is less than adjusted parcel area', async () => {
        const quantity = adjustedAreaOfParcelSD74445738 - 0.1
        const response = await server.inject(generateRequestOptions(parcelId, actionId, { quantity: quantity }))
        const payload = JSON.parse(response.payload)
        expect(response.statusCode).toBe(200)
        expect(payload).toEqual(
          expect.objectContaining({
            eligible: true,
            value: quantity * 114
          })
        )
      })

      test('parcel is ineligible if requested area is greater than adjusted parcel area', async () => {
        const quantity = adjustedAreaOfParcelSD74445738 + 0.1
        const response = await server.inject(generateRequestOptions(parcelId, actionId, { quantity }))
        const payload = JSON.parse(response.payload)
        expect(response.statusCode).toBe(200)
        expect(payload).toEqual(
          expect.objectContaining({
            eligible: false
          })
        )
      })
    })
  })
})

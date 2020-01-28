let server

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

  test('parcel SD74445738 is eligible for a payment under action FG1 - all rules enabled (except adjusted perimeter rule)', async () => {
    jest.mock(
      '../../data/rules.json',
      () => [
        {
          id: 1,
          type: 'prevalidation',
          groupname: 'Perimeter',
          description: 'Proposed fence length is longer than Total Parcel Perimeter',
          enabled: true,
          facts: [
            {
              id: 'totalPerimeter',
              description: 'Total Parcel Perimeter'
            }
          ],
          conditions: [{
            fact: 'requestedLength',
            operator: 'greaterThan',
            value: {
              fact: 'totalPerimeter'
            }
          }]
        },
        {
          id: 2,
          type: 'prevalidation',
          groupname: 'Perimeter',
          description: 'Proposed fence length is longer than Total Parcel Perimeter minus the Perimeter features',
          enabled: false,
          facts: [
            {
              id: 'totalPerimeter',
              description: 'Total Parcel Perimeter'
            },
            {
              id: 'perimeterRemoved',
              description: 'Total Feature Length',
              calculated: true,
              calculation: {
                operator: 'sumall',
                sourcefact: 'perimeterFeatures',
                path: '$..length'
              }
            },
            {
              id: 'usablePerimeter',
              description: 'Total usable perimeter length',
              calculated: true,
              calculation: {
                operator: 'subtract',
                value1: 'totalPerimeter',
                value2: 'perimeterRemoved'
              }
            },
            {
              id: 'requestedLength',
              description: 'Metres of fencing requested'
            }
          ],
          conditions: [{
            fact: 'usablePerimeter',
            operator: 'lessThanInclusive',
            value: {
              fact: 'requestedLength'
            }
          }]
        },
        {
          id: 4,
          type: 'eligibility',
          description: 'Previous Action date is within the last 5 years',
          enabled: true,
          facts: [
            {
              id: 'previousActions',
              description: 'Previous Action Dates'
            }
          ],
          conditions: [{
            fact: 'previousActions',
            path: '$..date',
            operator: 'lessThan5Years',
            value: '2020-01-20T00:00:01.000Z'
          }]
        },
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
        }
      ]
    )
    await setUpServer()
    const response = await server.inject(generateRequestOptions('SD74445738', 'FG1', { quantity: 139.4 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: true,
        value: 557.6
      })
    )
  })

  test('parcel SD74445738 is eligible for a payment under action FG1 - all rules enabled (except perimeter rule)', async () => {
    jest.mock(
      '../../data/rules.json',
      () => [
        {
          id: 1,
          type: 'prevalidation',
          groupname: 'Perimeter',
          description: 'Proposed fence length is longer than Total Parcel Perimeter',
          enabled: false,
          facts: [
            {
              id: 'totalPerimeter',
              description: 'Total Parcel Perimeter'
            }
          ],
          conditions: [{
            fact: 'requestedLength',
            operator: 'greaterThan',
            value: {
              fact: 'totalPerimeter'
            }
          }]
        },
        {
          id: 2,
          type: 'prevalidation',
          groupname: 'Perimeter',
          description: 'Proposed fence length is longer than Total Parcel Perimeter minus the Perimeter features',
          enabled: true,
          facts: [
            {
              id: 'totalPerimeter',
              description: 'Total Parcel Perimeter'
            },
            {
              id: 'perimeterRemoved',
              description: 'Total Feature Length',
              calculated: true,
              calculation: {
                operator: 'sumall',
                sourcefact: 'perimeterFeatures',
                path: '$..length'
              }
            },
            {
              id: 'usablePerimeter',
              description: 'Total usable perimeter length',
              calculated: true,
              calculation: {
                operator: 'subtract',
                value1: 'totalPerimeter',
                value2: 'perimeterRemoved'
              }
            },
            {
              id: 'requestedLength',
              description: 'Metres of fencing requested'
            }
          ],
          conditions: [{
            fact: 'usablePerimeter',
            operator: 'lessThanInclusive',
            value: {
              fact: 'requestedLength'
            }
          }]
        },
        {
          id: 4,
          type: 'eligibility',
          description: 'Previous Action date is within the last 5 years',
          enabled: true,
          facts: [
            {
              id: 'previousActions',
              description: 'Previous Action Dates'
            }
          ],
          conditions: [{
            fact: 'previousActions',
            path: '$..date',
            operator: 'lessThan5Years',
            value: '2020-01-20T00:00:01.000Z'
          }]
        },
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
        }
      ]
    )
    await setUpServer()
    const response = await server.inject(generateRequestOptions('SD74445738', 'FG1', { quantity: 130 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: true,
        value: 520
      })
    )
  })

  test('parcel SD75492628 isn\'t eligible for a payment under action FG1 - it has a previous action', async () => {
    jest.mock(
      '../../data/rules.json',
      () => [
        {
          id: 4,
          type: 'eligibility',
          description: 'Previous Action date is within the last 5 years',
          enabled: true,
          facts: [
            {
              id: 'previousActions',
              description: 'Previous Action Dates'
            }
          ],
          conditions: [{
            fact: 'previousActions',
            path: '$..date',
            operator: 'lessThan5Years',
            value: '2020-01-20T00:00:01.000Z'
          }]
        }
      ]
    )
    await setUpServer()
    const response = await server.inject(generateRequestOptions('SD75492628', 'FG1', { quantity: 104.8 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: false
      })
    )
  })

  test('parcel SD74445738 isn\'t eligible for a payment under action FG1 - claimed perimeter is greater than parcel perimeter', async () => {
    jest.mock(
      '../../data/rules.json',
      () => [
        {
          id: 1,
          type: 'prevalidation',
          groupname: 'Perimeter',
          description: 'Proposed fence length is longer than Total Parcel Perimeter',
          enabled: true,
          facts: [
            {
              id: 'totalPerimeter',
              description: 'Total Parcel Perimeter'
            }
          ],
          conditions: [{
            fact: 'requestedLength',
            operator: 'greaterThan',
            value: {
              fact: 'totalPerimeter'
            }
          }]
        }
      ]
    )
    await setUpServer()
    const response = await server.inject(generateRequestOptions('SD74445738', 'FG1', { quantity: 326 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: false
      })
    )
  })

  test('parcel SD74445738 isn\'t eligible for a payment under action FG1 - claimed perimeter is greater than adjusted perimeter', async () => {
    jest.mock(
      '../../data/rules.json',
      () => [
        {
          id: 2,
          type: 'prevalidation',
          groupname: 'Perimeter',
          description: 'Proposed fence length is longer than Total Parcel Perimeter minus the Perimeter features',
          enabled: true,
          facts: [
            {
              id: 'totalPerimeter',
              description: 'Total Parcel Perimeter'
            },
            {
              id: 'perimeterRemoved',
              description: 'Total Feature Length',
              calculated: true,
              calculation: {
                operator: 'sumall',
                sourcefact: 'perimeterFeatures',
                path: '$..length'
              }
            },
            {
              id: 'usablePerimeter',
              description: 'Total usable perimeter length',
              calculated: true,
              calculation: {
                operator: 'subtract',
                value1: 'totalPerimeter',
                value2: 'perimeterRemoved'
              }
            },
            {
              id: 'requestedLength',
              description: 'Metres of fencing requested'
            }
          ],
          conditions: [{
            fact: 'usablePerimeter',
            operator: 'lessThanInclusive',
            value: {
              fact: 'requestedLength'
            }
          }]
        }
      ]
    )
    await setUpServer()
    const response = await server.inject(generateRequestOptions('SD74445738', 'FG1', { quantity: 139.4 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: false
      })
    )
  })

  test('parcel SD78379604 isn\'t eligible for a payment under action FG1 - it is an SSSI', async () => {
    jest.mock(
      '../../data/rules.json',
      () => [
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
        }
      ]
    )
    await setUpServer()
    const response = await server.inject(generateRequestOptions('SD78379604', 'FG1', { quantity: 45.0 }))
    const payload = JSON.parse(response.payload)
    expect(response.statusCode).toBe(200)
    expect(payload).toEqual(
      expect.objectContaining({
        eligible: false
      })
    )
  })
})

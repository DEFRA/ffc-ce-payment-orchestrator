const parcelService = require('../../server/services/parcelService')

jest.mock(
  '../../data/parcels.json',
  () => ([{ ref: 'AB74445736' }])
)

describe('parcelService', () => {
  const parcelShape = {
    // Match known Parcel Ref format: start with two alphabetical characters
    // followed by eight numeric characters
    ref: expect.stringMatching(new RegExp('^[A-Za-z]{2}[0-9]{8}$'))
  }

  afterAll(() => {
    jest.unmock('../../data/parcels.json')
  })

  describe('get', () => {
    test('returns a collection of parcel objects', () => {
      const result = parcelService.get()

      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining(parcelShape)
      ]))
    })

    test('response contains only parcel objects', () => {
      const result = parcelService.get()

      expect(result).not.toEqual(expect.arrayContaining([
        expect.not.objectContaining(parcelShape)
      ]))
    })
  })

  describe('getByRef', () => {
    test('returns a single matching parcel object', () => {
      const result = parcelService.getByRef('AB74445736')

      expect(result).toEqual({ ref: 'AB74445736' })
    })

    test('returns null if the requested parcel is not found', () => {
      const result = parcelService.getByRef('not-a-real-ref')

      expect(result).toBe(null)
    })
  })
})

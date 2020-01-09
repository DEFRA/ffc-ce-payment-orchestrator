const parcelService = require('../../server/services/parcelService')

describe('parcelService', () => {
  const parcelShape = {
    id: expect.stringMatching(new RegExp('.+'))
  }

  test('returns a JSON collection of parcel objects', () => {
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

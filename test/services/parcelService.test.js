const parcelService = require('../../server/services/parcelService')

describe('parcelService', () => {
  const parcelShape = {
    // Match known Parcel Ref format: start with two alphabetical characters
    // followed by eight numeric characters
    ref: expect.stringMatching(new RegExp('^[A-Za-z]{2}[0-9]{8}$'))
  }

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

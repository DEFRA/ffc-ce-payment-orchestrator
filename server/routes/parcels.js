const parcelService = require('../services/parcelService')

module.exports = {
  method: 'GET',
  path: '/parcels',
  options: {
    handler: (request, h) => {
      const parcels = parcelService.get()

      return h.response({ parcels }).code(200)
    }
  }
}

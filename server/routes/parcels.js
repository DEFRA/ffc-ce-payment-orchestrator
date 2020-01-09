const parcelService = require('../services/parcelService')

module.exports = {
  method: 'GET',
  path: '/parcels',
  options: {
    handler: async (request, h) => {
      const parcels = parcelService.get()

      return h.response(JSON.stringify(parcels)).code(200)
    }
  }
}

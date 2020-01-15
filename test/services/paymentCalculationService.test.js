const fencingAction = require('../../server/actions/fencing')
const paymentService = require('../../server/services/paymentCalculationService')

jest.mock('../../server/actions/fencing')

const mockFencingActionValue = 77
const sampleLandParcel = {
  parcelRef: 'AB23AB74445736423433'
}

describe('paymentCalculationService', () => {
  describe('getValue', () => {
    beforeAll(() => {
      fencingAction.calculateValue.mockReturnValue(mockFencingActionValue)
    })

    test('gets the value of each action from the fencing action calculate method', () => {
      const sampleActions = [
        { actionId: 'FG1', options: { quantity: 50 } },
        { actionId: 'FG2', options: { quantity: 30 } }
      ]

      paymentService.getValue(sampleLandParcel, sampleActions)

      expect(fencingAction.calculateValue).toHaveBeenCalledWith(
        sampleLandParcel,
        sampleActions[0].options
      )
      expect(fencingAction.calculateValue).toHaveBeenCalledWith(
        sampleLandParcel,
        sampleActions[1].options
      )
    })

    test('returns 99 for single action', () => {
      // For initial prototype, expect each action to have value 99
      const sampleActions = [
        { actionId: 'FG1', options: { quantity: 70 } }
      ]
      const result = paymentService.getValue(sampleLandParcel, sampleActions)
      expect(result).toEqual(mockFencingActionValue)
    })

    test('returns the total value all requested actions', () => {
      const sampleActions = [
        { actionId: 'FG1', options: { quantity: 70 } },
        { actionId: 'FG2', options: { quantity: 74 } },
        { actionId: 'FG3', options: { quantity: 92 } }
      ]
      const result = paymentService.getValue(sampleLandParcel, sampleActions)
      expect(result).toEqual(mockFencingActionValue * 3) // For initial prototype, expect each action to have value 99
    })
  })

  describe('isEligible', () => {
    test('checks whether land parcel is eligible for each requested action', () => {
      const sampleActions = [
        { actionId: 'FG1', options: { quantity: 50 } },
        { actionId: 'FG2', options: { quantity: 30 } }
      ]

      paymentService.isEligible(sampleLandParcel, sampleActions)

      expect(fencingAction.isEligible).toHaveBeenCalledWith(
        sampleLandParcel,
        sampleActions[0].options
      )
      expect(fencingAction.isEligible).toHaveBeenCalledWith(
        sampleLandParcel,
        sampleActions[1].options
      )
    })

    test('returns true if land parcel is eligible for every requested action', () => {
      fencingAction.isEligible.mockReturnValue(true)
      const sampleActions = [
        { actionId: 'FG1', options: { quantity: 50 } },
        { actionId: 'FG2', options: { quantity: 30 } }
      ]

      const isEligible = paymentService.isEligible(sampleLandParcel, sampleActions)

      expect(isEligible).toBe(true)
    })

    test('returns false if land parcel is ineligible for any requested action', () => {
      fencingAction.isEligible.mockReturnValue(true)
      fencingAction.isEligible.mockReturnValueOnce(false)
      const sampleActions = [
        { actionId: 'FG1', options: { quantity: 50 } },
        { actionId: 'FG2', options: { quantity: 30 } },
        { actionId: 'FG2', options: { quantity: 80 } }
      ]

      const isEligible = paymentService.isEligible(sampleLandParcel, sampleActions)

      expect(isEligible).toBe(false)
    })
  })
})

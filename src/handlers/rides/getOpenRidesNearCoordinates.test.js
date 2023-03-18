const getOpenRidesNearCoordinates = require("./getOpenRidesNearCoordinates")
const eventGenerator = require("../../tests/utils/eventGenerator")
const validators = require("../../tests/utils/validators")
const rideUtil = require("../../utils/database/rides")
const {
  existingUser,
  existingRide,
  context: contextBase,
} = require("../../tests/staticData")

jest.mock("../../utils/database/rides")

const context = {
  ...contextBase,
  prev: {
    userId: existingUser._id,
  },
}

afterEach(() => {
  jest.resetAllMocks()
})

describe("GET /rides", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if lat evaluates to false", async () => {
      const event = eventGenerator({
        queryStringObject: {
          lat: "",
          lng: "100",
        },
      })

      const res = await getOpenRidesNearCoordinates.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if lng evaluates to false", async () => {
      const event = eventGenerator({
        queryStringObject: {
          lat: "50",
          lng: "",
        },
      })

      const res = await getOpenRidesNearCoordinates.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if maxDistance is less than 10,000", async () => {
      const event = eventGenerator({
        queryStringObject: {
          maxDistance: "100",
          lat: "50",
          lng: "100",
        },
      })

      const res = await getOpenRidesNearCoordinates.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe(
        "MaxDistance should be greater than 10,000m"
      )
    })
  })

  describe("Return 200 if request is valid", () => {
    test("Should return 200 and message if there are no open rides", async () => {
      rideUtil.DBFindUpcomingOpenRidesNearCoordinates.mockImplementation(
        () => []
      )

      const event = eventGenerator({
        queryStringObject: {
          maxDistance: "15000",
          lat: "50",
          lng: "100",
        },
      })

      const res = await getOpenRidesNearCoordinates.handler(event, context)

      // mocks
      expect(
        rideUtil.DBFindUpcomingOpenRidesNearCoordinates
      ).toHaveBeenCalledWith(15000, 100, 50)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe(
        "There are no upcoming rides, near coordinates"
      )
    })

    test("Should return 200 and rides if there are rides near coordinates", async () => {
      rideUtil.DBFindUpcomingOpenRidesNearCoordinates.mockImplementation(() => [
        existingRide,
      ])

      const event = eventGenerator({
        queryStringObject: {
          maxDistance: "15000",
          lat: "50",
          lng: "100",
        },
      })

      const res = await getOpenRidesNearCoordinates.handler(event, context)

      // mocks
      expect(
        rideUtil.DBFindUpcomingOpenRidesNearCoordinates
      ).toHaveBeenCalledWith(15000, 100, 50)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual([existingRide])
    })
  })

  describe("Return 500 if there is an error", () => {
    test("Should return 500 and error message", async () => {
      rideUtil.DBFindUpcomingOpenRidesNearCoordinates.mockImplementation(() => {
        throw new Error("Error finding rides")
      })

      const event = eventGenerator({
        queryStringObject: {
          maxDistance: "15000",
          lat: "50",
          lng: "100",
        },
      })

      const res = await getOpenRidesNearCoordinates.handler(event, context)

      // mocks
      expect(
        rideUtil.DBFindUpcomingOpenRidesNearCoordinates
      ).toHaveBeenCalledWith(15000, 100, 50)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding rides")
    })
  })
})

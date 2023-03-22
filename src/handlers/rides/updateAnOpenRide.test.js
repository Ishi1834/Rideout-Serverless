const updateAnOpenRide = require("./updateAnOpenRide")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const rideUtil = require("../../utils/database/rides")
const {
  existingUser,
  existingRide,
  context: contextBase,
} = require("../../../tests/staticData")

jest.mock("../../utils/database/rides")
jest.mock("../../config/dbConn")

const context = {
  ...contextBase,
  prev: {
    userId: existingUser._id,
  },
}

describe("PATCH /rides/{rideId}", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if no property is given in the body", async () => {
      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await updateAnOpenRide.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe(
        "Atleast 1 property must be given, to update a ride"
      )
    })

    test("Should return 400 if startLocation isn't an array", async () => {
      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {
          startLocation: "loc",
        },
      })

      const res = await updateAnOpenRide.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe(
        "Location should be an array of 2 numbers"
      )
    })

    test("Should return 400 if startLocation does have length 2", async () => {
      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {
          startLocation: [""],
        },
      })

      const res = await updateAnOpenRide.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe(
        "Location should be an array of 2 numbers"
      )
    })

    test("Should return 400 if rideId has no associated ride", async () => {
      rideUtil.DBFindRideById.mockImplementation(() => null)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {
          startLocation: [50, 50],
        },
      })

      const res = await updateAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid ride")
    })
  })

  describe("Return 403 if user doesn't have authorization", () => {
    test("Should return 403 if ride belongs to a club", async () => {
      const testRide = {
        ...existingRide,
        createdBy: {
          username: existingUser.username,
          userId: existingUser._id,
        },
        clubId: "existingClubId",
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {
          startLocation: [50, 50],
        },
      })

      const res = await updateAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(403)
      expect(JSON.parse(res.body).message).toBe("Forbidden")
    })

    test("Should return 403 if userId doesn't match ride creator id", async () => {
      const testRide = {
        ...existingRide,
        createdBy: {
          username: "differentUsername",
          userId: "differentUserId",
        },
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {
          startLocation: [50, 50],
        },
      })

      const res = await updateAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(403)
      expect(JSON.parse(res.body).message).toBe("Forbidden")
    })
  })

  describe("Return 200 if request is valid", () => {
    test("Should return 200 and update startLocation of startLocation is given in body", async () => {
      const testRide = {
        ...existingRide,
        save: jest.fn(),
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)
      testRide.save.mockImplementation(() => testRide)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {
          startLocation: [40, 50],
        },
      })

      const res = await updateAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      expect(testRide.save).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual({
        message: "Ride updated",
        ride: {
          ...existingRide,
          startLocation: {
            type: "Point",
            coordinates: [40, 50],
          },
        },
      })
    })

    test("Should return 200 and update properties which are given in body", async () => {
      const testRide = {
        ...existingRide,
        save: jest.fn(),
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)
      testRide.save.mockImplementation(() => testRide)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {
          rideType: "training",
          distance: "33",
          speed: "17",
          description: "full gas",
          cafeStops: "midway cake stop",
          route: "route",
        },
      })

      const res = await updateAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      expect(testRide.save).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual({
        message: "Ride updated",
        ride: {
          ...existingRide,
          rideType: "training",
          distance: "33",
          speed: "17",
          description: "full gas",
          cafeStops: "midway cake stop",
          route: "route",
        },
      })
    })
  })
})

const updateAClubRide = require("./updateAClubRide")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const rideUtil = require("../../utils/database/rides")
const {
  existingClub,
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
    userClubs: existingUser.clubs,
  },
}

describe("PATCH /clubs/{clubId}/rides/{rideId}", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if no property is given in the body", async () => {
      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await updateAClubRide.handler(event, context)

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
          clubId: existingClub._id,
          rideId: existingRide._id,
        },
        body: {
          startLocation: "loc",
        },
      })

      const res = await updateAClubRide.handler(event, context)

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
          clubId: existingClub._id,
          rideId: existingRide._id,
        },
        body: {
          startLocation: [""],
        },
      })

      const res = await updateAClubRide.handler(event, context)

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
          clubId: existingClub._id,
          rideId: existingRide._id,
        },
        body: {
          startLocation: [50, 50],
        },
      })

      const res = await updateAClubRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid ride")
    })
  })

  describe("Return 403 if user doesn't have authorization", () => {
    test("Should return 403 if ride belongs to a different club", async () => {
      const testRide = {
        ...existingRide,
        clubId: "differentClubId",
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
          rideId: existingRide._id,
        },
        body: {
          startLocation: [50, 50],
        },
      })

      const res = await updateAClubRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(403)
      expect(JSON.parse(res.body).message).toBe("Forbidden")
    })

    test("Should return 403 if ride doesn't have clubId", async () => {
      const testRide = {
        ...existingRide,
        clubId: null,
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
          rideId: existingRide._id,
        },
        body: {
          startLocation: [50, 50],
        },
      })

      const res = await updateAClubRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(403)
      expect(JSON.parse(res.body).message).toBe("Forbidden")
    })

    test("Should return 403 if user isn't ride creator", async () => {
      const testRide = {
        ...existingRide,
        createdBy: {
          username: "differetUsername",
          userId: "differentUserId",
        },
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
          rideId: existingRide._id,
        },
        body: {
          startLocation: [50, 50],
        },
      })

      const res = await updateAClubRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(403)
      expect(JSON.parse(res.body).message).toBe("Forbidden")
    })
  })

  describe("Return 200 if valid request is made", () => {
    test("Should return 200 and update startLocation of startLocation is given in body", async () => {
      const testRide = {
        ...existingRide,
        save: jest.fn(),
        clubId: existingClub._id,
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)
      testRide.save.mockImplementation(() => testRide)

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
          rideId: existingRide._id,
        },
        body: {
          startLocation: [40, 50],
        },
      })

      const res = await updateAClubRide.handler(event, context)

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
          clubId: existingClub._id,
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
        clubId: existingClub._id,
        save: jest.fn(),
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)
      testRide.save.mockImplementation(() => testRide)

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
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

      const res = await updateAClubRide.handler(event, context)

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
          clubId: existingClub._id,
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
  describe("Return 500 if there is an error", () => {
    test("Should return 500 and error message", async () => {
      rideUtil.DBFindRideById.mockImplementation(() => {
        throw new Error("Error finding ride")
      })

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
          rideId: existingRide._id,
        },
        body: {
          startLocation: [50, 50],
        },
      })

      const res = await updateAClubRide.handler(event, context)

      // mock
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding ride")
    })
  })
})

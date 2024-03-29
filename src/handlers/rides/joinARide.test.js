const joinARide = require("./joinARide")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const rideUtil = require("../../utils/database/rides")
const userUtil = require("../../utils/database/users")
const {
  existingUser,
  existingRide,
  context: contextBase,
} = require("../../../tests/staticData")

jest.mock("../../utils/database/rides")
jest.mock("../../utils/database/users")
jest.mock("../../config/dbConn")

const context = {
  ...contextBase,
  prev: {
    userId: existingUser._id,
  },
}

describe("PATCH /rides/{rideId}/join && clubs/{clubId}/rides/{rideId}/join", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if userId has no associated user", async () => {
      userUtil.DBFindUserById.mockImplementation(() => null)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await joinARide.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid user")
    })

    test("Should return 400 if rideId has no associated ride", async () => {
      userUtil.DBFindUserById.mockImplementation(() => existingUser)
      rideUtil.DBFindRideById.mockImplementation(() => null)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await joinARide.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid ride")
    })

    test("Should return 400 if user has already joined ride", async () => {
      const testRide = {
        ...existingRide,
        openRide: true,
      }
      userUtil.DBFindUserById.mockImplementation(() => existingUser)
      rideUtil.DBFindRideById.mockImplementation(() => testRide)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await joinARide.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe(
        "User has already joined this ride"
      )
    })
  })

  describe("Return 403 if user doesn't have correct authorization", () => {
    describe("Route /rides/{rideId}", () => {
      test("Should return 403 if ride isn't an openRide and route isn't", async () => {
        const testRide = {
          ...existingRide,
          openRide: false,
        }
        userUtil.DBFindUserById.mockImplementation(() => existingUser)
        rideUtil.DBFindRideById.mockImplementation(() => testRide)

        const event = eventGenerator({
          pathParametersObject: {
            rideId: existingRide._id,
          },
          body: {},
        })

        const res = await joinARide.handler(event, context)

        // mocks
        expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
        expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
        // response
        expect(validators.isApiGatewayResponse(res)).toBe(true)
        expect(res.statusCode).toBe(403)
        expect(JSON.parse(res.body).message).toBe("Forbidden")
      })
    })

    describe("Route /clubs/{clubId}/rides/{rideId}", () => {
      test("Should return 403 if ride.clubId doesn't match path paramter clubId", async () => {
        const testRide = {
          ...existingRide,
          openRide: false,
        }
        userUtil.DBFindUserById.mockImplementation(() => existingUser)
        rideUtil.DBFindRideById.mockImplementation(() => testRide)

        const event = eventGenerator({
          pathParametersObject: {
            rideId: existingRide._id,
            clubId: "differentClubId",
          },
          body: {},
        })

        const res = await joinARide.handler(event, context)

        // mocks
        expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
        expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
        // response
        expect(validators.isApiGatewayResponse(res)).toBe(true)
        expect(res.statusCode).toBe(403)
        expect(JSON.parse(res.body).message).toBe("Forbidden")
      })
    })
  })

  describe("Return 200 if request is valid", () => {
    test("Should return 200 and add user to ride", async () => {
      const testUser = {
        ...existingUser,
        rides: [],
        save: jest.fn(),
      }
      const testRide = {
        ...existingRide,
        signedUpCyclists: [],
        openRide: true,
        save: jest.fn(),
      }
      userUtil.DBFindUserById.mockImplementation(() => testUser)
      rideUtil.DBFindRideById.mockImplementation(() => testRide)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await joinARide.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      expect(testRide).toMatchObject({
        ...existingRide,
        signedUpCyclists: [
          {
            username: existingUser.username,
            userId: existingUser._id,
          },
        ],
        openRide: true,
      })
      expect(testRide.save).toHaveBeenCalledTimes(1)
      expect(testUser).toMatchObject({
        ...existingUser,
        rides: [existingRide._id],
      })
      expect(testUser.save).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("Ride joined")
    })
  })
})

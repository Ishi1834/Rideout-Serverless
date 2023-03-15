const joinAnOpenRide = require("./joinAnOpenRide")
const eventGenerator = require("../../tests/utils/eventGenerator")
const validators = require("../../tests/utils/validators")
const rideUtil = require("../../utils/database/rides")
const userUtil = require("../../utils/database/users")
const {
  existingUser,
  existingRide,
  context: contextBase,
} = require("../../tests/staticData")

jest.mock("../../utils/database/rides")
jest.mock("../../utils/database/users")

const context = {
  ...contextBase,
  prev: {
    userId: existingUser._id,
  },
}

afterEach(() => {
  jest.resetAllMocks()
})

describe("PATCH /rides/{rideId}/join", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if rideId has no associated ride", async () => {
      rideUtil.DBFindRideById.mockImplementation(() => null)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await joinAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid ride")
    })

    test("Should return 400 if userId has no associated user", async () => {
      const testRide = {
        ...existingRide,
        openRide: true,
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)
      userUtil.DBFindUserById.mockImplementation(() => null)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await joinAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid user")
    })

    test("Should return 400 if user has already joined ride", async () => {
      const testRide = {
        ...existingRide,
        openRide: true,
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)
      userUtil.DBFindUserById.mockImplementation(() => existingUser)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await joinAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe(
        "User has already joined this ride"
      )
    })
  })

  describe("Return 403 if user doesn't have correct authorization", () => {
    test("Should return 403 if ride isn't an openRide", async () => {
      const testRide = {
        ...existingRide,
        openRide: false,
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await joinAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(403)
      expect(JSON.parse(res.body).message).toBe("Forbidden")
    })
  })

  describe("Return 200 if request is valid", () => {
    test("Should return 200 and add user to ride", async () => {
      const testRide = {
        ...existingRide,
        signedUpCyclists: [],
        openRide: true,
        save: jest.fn(),
      }
      const testUser = {
        ...existingUser,
        rides: [],
        save: jest.fn(),
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)
      userUtil.DBFindUserById.mockImplementation(() => testUser)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await joinAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
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

  describe("Return 500 if there is an error", () => {
    test("Should return 500 and error message", async () => {
      rideUtil.DBFindRideById.mockImplementation(() => {
        throw new Error("Error finding ride")
      })

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await joinAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding ride")
    })
  })
})

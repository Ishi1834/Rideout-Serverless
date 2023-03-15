const deleteAnOpenRide = require("./deleteAnOpenRide")
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

describe("DELETE /rides/{rideId}", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if rideId has no associated ride", async () => {
      rideUtil.DBFindRideById.mockImplementation(() => null)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await deleteAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid ride")
    })
  })

  describe("Return 403 if user doesn't have correct authorization", () => {
    test("Should return 403 if user isn't ride creator", async () => {
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
        body: {},
      })

      const res = await deleteAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(403)
      expect(JSON.parse(res.body).message).toBe("Forbidden")
    })

    test("Should return 403 if ride has clubId", async () => {
      const testRide = {
        ...existingRide,
        clubId: "existingClubId",
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await deleteAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(403)
      expect(JSON.parse(res.body).message).toBe("Forbidden")
    })
  })

  describe("Return 200 if valid request is made", () => {
    test("Should return 200 if delete ride if user is ride creator", async () => {
      const testRide = {
        ...existingRide,
        signedUpCyclists: [
          {
            username: existingUser.username,
            userId: existingUser._id,
          },
        ],
        createdBy: {
          username: existingUser.username,
          userId: existingUser._id,
        },
        deleteOne: jest.fn(),
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)
      userUtil.DBRemoveRideFomUser.mockImplementation(() => true)

      const event = eventGenerator({
        pathParametersObject: {
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await deleteAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      expect(userUtil.DBRemoveRideFomUser).toHaveBeenCalledWith(
        existingUser._id,
        existingRide._id
      )
      expect(userUtil.DBRemoveRideFomUser).toHaveBeenCalledTimes(1)
      expect(testRide.deleteOne).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("Ride deleted")
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

      const res = await deleteAnOpenRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding ride")
    })
  })
})

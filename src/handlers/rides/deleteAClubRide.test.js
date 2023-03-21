const deleteAClubRide = require("./deleteAClubRide")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const rideUtil = require("../../utils/database/rides")
const userUtil = require("../../utils/database/users")
const clubUtil = require("../../utils/database/clubs")
const {
  existingClub,
  existingUser,
  existingRide,
  context: contextBase,
} = require("../../../tests/staticData")

jest.mock("../../utils/database/rides")
jest.mock("../../utils/database/users")
jest.mock("../../utils/database/clubs")
jest.mock("../../config/dbConn")

const context = {
  ...contextBase,
  prev: {
    userId: existingUser._id,
  },
}

describe("DELETE /clubs/{clubId}/rides/{rideId}", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if rideId has no associated ride", async () => {
      rideUtil.DBFindRideById.mockImplementation(() => null)

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await deleteAClubRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid ride")
    })
  })

  describe("Return 403 if user doesn't have correct permission", () => {
    test("Should return 403 if ride.clubId doesn't match clubId", async () => {
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
        body: {},
      })

      const res = await deleteAClubRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(403)
      expect(JSON.parse(res.body).message).toBe("Forbidden")
    })

    test("Should return 403 if user isn't ride creator and doesn't have role 'admin'", async () => {
      const context = {
        ...contextBase,
        prev: {
          userId: "differentUserId",
          userAuthorization: "editor",
        },
      }
      const testRide = {
        ...existingRide,
        clubId: existingClub._id,
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await deleteAClubRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(403)
      expect(JSON.parse(res.body).message).toBe("Forbidden")
    })
  })

  describe("Return 200 if request is valid", () => {
    test("Should return 200 and delete ride if user is ride creator", async () => {
      const context = {
        ...contextBase,
        prev: {
          userId: existingUser._id,
          userAuthorization: "editor",
        },
      }
      const testRide = {
        ...existingRide,
        signedUpCyclists: [
          {
            username: existingUser.username,
            userId: existingUser._id,
          },
        ],
        clubId: existingClub._id,
        deleteOne: jest.fn(),
      }
      const testClub = {
        ...existingClub,
        rides: [existingRide._id],
        activitiesCount: 2,
        save: jest.fn(),
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)
      userUtil.DBRemoveRideFomUser.mockImplementation(() => true)
      clubUtil.DBFindClubById.mockImplementation(() => testClub)

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await deleteAClubRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      expect(userUtil.DBRemoveRideFomUser).toHaveBeenCalledTimes(1)
      expect(userUtil.DBRemoveRideFomUser).toHaveBeenCalledWith(
        existingUser._id,
        existingRide._id
      )
      expect(testRide.deleteOne).toHaveBeenCalledTimes(1)
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith(existingClub._id)
      expect(testClub).toMatchObject({
        ...existingClub,
        rides: [],
        activitiesCount: 1,
      })
      expect(testClub.save).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("Ride deleted")
    })

    test("Should return 200 and delete ride if club no longer exists", async () => {
      const context = {
        ...contextBase,
        prev: {
          userId: existingUser._id,
          userAuthorization: "editor",
        },
      }
      const testRide = {
        ...existingRide,
        signedUpCyclists: [
          {
            username: existingUser.username,
            userId: existingUser._id,
          },
        ],
        clubId: existingClub._id,
        deleteOne: jest.fn(),
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)
      userUtil.DBRemoveRideFomUser.mockImplementation(() => true)
      clubUtil.DBFindClubById.mockImplementation(() => null)

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await deleteAClubRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      expect(userUtil.DBRemoveRideFomUser).toHaveBeenCalledTimes(1)
      expect(userUtil.DBRemoveRideFomUser).toHaveBeenCalledWith(
        existingUser._id,
        existingRide._id
      )
      expect(testRide.deleteOne).toHaveBeenCalledTimes(1)
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith(existingClub._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("Ride deleted")
    })

    test("Should return 200 and delete ride if user isn't ride creator but has role 'admin'", async () => {
      const context = {
        ...contextBase,
        prev: {
          userId: "differentUserId",
          userAuthorization: "admin",
        },
      }
      const testRide = {
        ...existingRide,
        signedUpCyclists: [
          {
            username: existingUser.username,
            userId: existingUser._id,
          },
        ],
        clubId: existingClub._id,
        deleteOne: jest.fn(),
      }
      const testClub = {
        ...existingClub,
        rides: [existingRide._id],
        activitiesCount: 2,
        save: jest.fn(),
      }
      rideUtil.DBFindRideById.mockImplementation(() => testRide)
      userUtil.DBRemoveRideFomUser.mockImplementation(() => true)
      clubUtil.DBFindClubById.mockImplementation(() => testClub)

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await deleteAClubRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      expect(userUtil.DBRemoveRideFomUser).toHaveBeenCalledTimes(1)
      expect(userUtil.DBRemoveRideFomUser).toHaveBeenCalledWith(
        existingUser._id,
        existingRide._id
      )
      expect(testRide.deleteOne).toHaveBeenCalledTimes(1)
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith(existingClub._id)
      expect(testClub).toMatchObject({
        ...existingClub,
        rides: [],
        activitiesCount: 1,
      })
      expect(testClub.save).toHaveBeenCalledTimes(1)
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
          clubId: existingClub._id,
          rideId: existingRide._id,
        },
        body: {},
      })

      const res = await deleteAClubRide.handler(event, context)

      // mocks
      expect(rideUtil.DBFindRideById).toHaveBeenCalledWith(existingRide._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding ride")
    })
  })
})

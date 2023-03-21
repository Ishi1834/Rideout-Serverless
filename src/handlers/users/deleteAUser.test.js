const deleteAUser = require("./deleteAUser")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const userUtil = require("../../utils/database/users")
const rideUtil = require("../../utils/database/rides")
const clubUtil = require("../../utils/database/clubs")
const {
  existingUser,
  context: contextBase,
  existingClub,
  existingRide,
} = require("../../../tests/staticData")

jest.mock("../../utils/database/users")
jest.mock("../../utils/database/rides")
jest.mock("../../utils/database/clubs")
jest.mock("../../config/dbConn")

const context = {
  ...contextBase,
  prev: {
    userId: existingUser._id,
  },
}

describe("DELETE /users/{userId}", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if userId has no associated user", async () => {
      userUtil.DBFindUserById.mockImplementation(() => null)

      const event = eventGenerator({
        body: {},
        pathParametersObject: {
          userId: "invalidUserId",
        },
      })

      const res = await deleteAUser.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith("invalidUserId")
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid user")
    })
  })

  describe("Return 200 if valid request is made", () => {
    test("Should return 200 and remove user from rides and clubs", async () => {
      const testUser = {
        ...existingUser,
        clubs: [
          {
            clubId: existingClub._id,
            authorization: "admin",
          },
        ],
        rides: [existingRide._id],
        deleteOne: jest.fn(),
      }
      userUtil.DBFindUserById.mockImplementation(() => testUser)
      clubUtil.DBRemoveUserFromClub.mockImplementation(() => true)
      rideUtil.DBRemoveUserFromRide.mockImplementation(() => true)

      const event = eventGenerator({
        body: {},
        pathParametersObject: {
          userId: existingUser._id,
        },
      })

      const res = await deleteAUser.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      expect(clubUtil.DBRemoveUserFromClub).toHaveBeenCalledWith(
        existingClub._id,
        existingUser._id
      )
      expect(clubUtil.DBRemoveUserFromClub).toHaveBeenCalledTimes(1)
      expect(rideUtil.DBRemoveUserFromRide).toHaveBeenCalledWith(
        existingRide._id,
        existingUser._id
      )
      expect(rideUtil.DBRemoveUserFromRide).toHaveBeenCalledTimes(1)
      expect(testUser.deleteOne).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("User deleted")
    })
  })

  describe("Return 500 if there is an error", () => {
    test("Should return 500 and error message", async () => {
      userUtil.DBFindUserById.mockImplementation(() => {
        throw new Error("Error finding user")
      })

      const event = eventGenerator({
        body: {},
        pathParametersObject: {
          userId: existingUser._id,
        },
      })

      const res = await deleteAUser.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding user")
    })
  })
})

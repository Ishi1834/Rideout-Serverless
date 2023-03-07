const deleteAClub = require("./deleteAClub")
const eventGenerator = require("../../tests/utils/eventGenerator")
const validators = require("../../tests/utils/validators")
const userUtil = require("../../utils/database/users")
const clubUtil = require("../../utils/database/clubs")
const {
  existingClub,
  existingUser,
  context: contextBase,
} = require("../../tests/staticData")

jest.mock("../../utils/database/users")
jest.mock("../../utils/database/clubs")

const context = {
  ...contextBase,
  prev: {
    userId: existingUser._id,
    userClubs: existingUser.clubs,
  },
}

afterEach(() => {
  jest.resetAllMocks()
})

describe("DELETE /clubs/:clubId", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if clubId has no associated club", async () => {
      clubUtil.DBFindClubById.mockImplementation(() => null)
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "invalidClubId",
        },
      })

      const res = await deleteAClub.handler(event, context)

      // mocks
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("invalidClubId")
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid club")
    })
  })

  describe("Return 200 if valid request is made", () => {
    test("Should return 200 if club is deleted", async () => {
      const testUser = {
        ...existingUser,
        clubs: [
          {
            clubId: "23f75719297c7sd30cadbe98",
            authorization: "admin",
          },
        ],
        save: jest.fn(),
      }
      const testClub = {
        ...existingClub,
        members: [
          ...existingClub.members,
          {
            username: "removedUser",
            userId: "noLongerExistingUser",
            authorization: "user",
          },
        ],
        deleteOne: jest.fn(),
      }
      clubUtil.DBFindClubById.mockImplementation(() => testClub)
      userUtil.DBFindUserById.mockImplementationOnce(() => testUser)
      userUtil.DBFindUserById.mockImplementationOnce(() => null)
      /**
       * Should continue if user returned is null
       */
      const event = eventGenerator({
        pathParametersObject: {
          clubId: testClub._id,
        },
      })

      const res = await deleteAClub.handler(event, context)

      // mocks
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith(testClub._id)
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(testUser._id)
      expect(testUser.save).toHaveBeenCalledTimes(1)
      expect(testUser.clubs).toHaveLength(0)
      expect(testClub.deleteOne).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("Club deleted")
    })
  })

  describe("Return 500 if there is an error", () => {
    test("Should return 500 and error message", async () => {
      clubUtil.DBFindClubById.mockImplementation(() => {
        throw new Error("Error finding club")
      })
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "validClubId",
        },
      })

      const res = await deleteAClub.handler(event, context)

      // mocks
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("validClubId")
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding club")
    })
  })
})

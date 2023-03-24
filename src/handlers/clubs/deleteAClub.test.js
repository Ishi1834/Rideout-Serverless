const deleteAClub = require("./deleteAClub")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const userUtil = require("../../utils/database/users")
const clubUtil = require("../../utils/database/clubs")
const {
  existingClub,
  existingUser,
  context: contextBase,
} = require("../../../tests/staticData")

jest.mock("../../utils/database/users")
jest.mock("../../utils/database/clubs")
jest.mock("../../config/dbConn")

const context = {
  ...contextBase,
  prev: {
    userId: existingUser._id,
    userClubs: existingUser.clubs,
  },
}

describe("DELETE /clubs/{clubId}", () => {
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
      userUtil.DBRemoveClubFromUser.mockImplementationOnce(() => true)
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
      expect(userUtil.DBRemoveClubFromUser).toHaveBeenCalledWith(
        testUser._id,
        testClub._id
      )
      expect(testClub.deleteOne).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("Club deleted")
    })
  })
})

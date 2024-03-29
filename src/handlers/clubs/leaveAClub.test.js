const leaveAClub = require("./leaveAClub")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const clubUtil = require("../../utils/database/clubs")
const userUtil = require("../../utils/database/users")
const {
  existingClub,
  existingUser,
  context: contextBase,
} = require("../../../tests/staticData")

jest.mock("../../utils/database/clubs")
jest.mock("../../utils/database/users")
jest.mock("../../config/dbConn")

const context = {
  ...contextBase,
  prev: {
    userId: existingUser._id,
    userClubs: existingUser.clubs,
  },
}

describe("PATCH /clubs/{clubId}/leave", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if clubId has no associated club", async () => {
      clubUtil.DBFindClubById.mockImplementation(() => null)
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "invalidClubId",
        },
      })

      const res = await leaveAClub.handler(event, context)

      // mock
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("invalidClubId")
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid club")
    })

    test("Should return 400 if userId has no associated user", async () => {
      clubUtil.DBFindClubById.mockImplementation(() => existingClub)
      userUtil.DBFindUserById.mockImplementation(() => null)
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "validClubId",
        },
      })

      const res = await leaveAClub.handler(event, context)

      // mock
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("validClubId")
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid user")
    })
  })

  describe("Return 200 if valid request is made", () => {
    test("Should remove user and return 200", async () => {
      const testClub = {
        ...existingClub,
        members: [
          {
            username: existingUser.username,
            userId: existingUser._id,
          },
        ],
        save: jest.fn(),
      }
      const testUser = {
        ...existingUser,
        clubs: [
          {
            name: existingClub.name,
            clubId: existingClub._id,
          },
        ],
        save: jest.fn(),
      }
      clubUtil.DBFindClubById.mockImplementation(() => testClub)
      userUtil.DBFindUserById.mockImplementation(() => testUser)
      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
      })

      const res = await leaveAClub.handler(event, context)

      // mock
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith(existingClub._id)
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      expect(testClub).toMatchObject({
        ...existingClub,
        cyclistCount: 0,
        members: [],
      })
      expect(testUser).toMatchObject({
        ...existingUser,
        clubs: [],
      })
      expect(testClub.save).toHaveBeenCalledTimes(1)
      expect(testUser.save).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("You have left this club")
    })
  })
})

const removeAClubMember = require("./removeAClubMember")
const eventGenerator = require("../../tests/utils/eventGenerator")
const validators = require("../../tests/utils/validators")
const clubUtil = require("../../utils/database/clubs")
const userUtil = require("../../utils/database/users")
const {
  existingClub,
  existingUser,
  context: contextBase,
} = require("../../tests/staticData")

jest.mock("../../utils/database/clubs")
jest.mock("../../utils/database/users")

afterEach(() => {
  jest.resetAllMocks()
})

const context = {
  ...contextBase,
  prev: {
    userId: existingUser._id,
    userClubs: existingUser.clubs,
  },
}

describe("DELETE /clubs/{clubId}/members", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if userId isn't given", async () => {
      const event = eventGenerator({
        body: {},
        pathParametersObject: {
          clubId: "validClubId",
        },
      })

      const res = await removeAClubMember.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if userId has no associated user", async () => {
      userUtil.DBFindUserById.mockImplementation(() => null)

      const event = eventGenerator({
        body: {
          userId: "invalidUserId",
        },
        pathParametersObject: {
          clubId: "validClubId",
        },
      })

      const res = await removeAClubMember.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith("invalidUserId")
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid user")
    })

    test("Should return 400 if clubId has no associated club", async () => {
      userUtil.DBFindUserById.mockImplementation(() => existingUser)
      clubUtil.DBFindClubById.mockImplementation(() => null)

      const event = eventGenerator({
        body: {
          userId: "validUserId",
        },
        pathParametersObject: {
          clubId: "invalidClubId",
        },
      })

      const res = await removeAClubMember.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith("validUserId")
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("invalidClubId")
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid club")
    })
  })

  describe("Return 200 if valid request is made", () => {
    test("Should return 200 and remove user from club", async () => {
      const testUser = {
        ...existingUser,
        clubs: [
          {
            clubId: existingClub._id,
            authorization: "user",
          },
          {
            clubId: "randommongooseobjectid",
            authorization: "editor",
          },
        ],
        save: jest.fn(),
      }
      const testClub = {
        ...existingClub,
        cyclistCount: 2,
        members: [
          {
            authorization: "user",
            username: existingUser.username,
            userId: existingUser._id,
          },
          {
            authorization: "admin",
            username: "username",
            userId: "randommongodbobjectid",
          },
        ],
        save: jest.fn(),
      }
      userUtil.DBFindUserById.mockImplementation(() => testUser)
      clubUtil.DBFindClubById.mockImplementation(() => testClub)

      const event = eventGenerator({
        body: {
          userId: testUser._id,
        },
        pathParametersObject: {
          clubId: testClub._id,
        },
      })

      const res = await removeAClubMember.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(testUser._id)
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith(testClub._id)
      expect(testUser).toEqual({
        ...testUser,
        clubs: [
          {
            clubId: "randommongooseobjectid",
            authorization: "editor",
          },
        ],
      })
      expect(testClub).toEqual({
        ...testClub,
        cyclistCount: 1,
        members: [
          {
            authorization: "admin",
            username: "username",
            userId: "randommongodbobjectid",
          },
        ],
      })
      expect(testUser.save).toHaveBeenCalledTimes(1)
      expect(testClub.save).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("User removed from club")
    })
  })

  describe("Return 500 if there is an error", () => {
    test("Should return 500 and error message", async () => {
      userUtil.DBFindUserById.mockImplementation(() => {
        throw new Error("Error finding user")
      })

      const event = eventGenerator({
        body: {
          userId: existingUser._id,
        },
        pathParametersObject: {
          clubId: existingClub._id,
        },
      })

      const res = await removeAClubMember.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding user")
    })
  })
})

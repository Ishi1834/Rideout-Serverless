const changeAClubMemberRole = require("./changeAClubMemberRole")
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

describe("PATCH /clubs/{clubId}/members", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if userId and changeTo isn't given", async () => {
      const event = eventGenerator({
        body: {},
        pathParametersObject: {
          clubId: "validClubId",
        },
      })

      const res = await changeAClubMemberRole.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if changeTo isn't 'user', 'editor' or 'admin'", async () => {
      const event = eventGenerator({
        body: {
          userId: existingUser._id,
          changeTo: "incorrect",
        },
        pathParametersObject: {
          clubId: "validClubId",
        },
      })

      const res = await changeAClubMemberRole.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe(
        "ChangeTo should be one of 'user', 'editor' or 'admin'"
      )
    })

    test("Should return 400 if userId has no associated user", async () => {
      userUtil.DBFindUserById.mockImplementation(() => null)

      const event = eventGenerator({
        body: {
          userId: existingUser._id,
          changeTo: "editor",
        },
        pathParametersObject: {
          clubId: "validClubId",
        },
      })

      const res = await changeAClubMemberRole.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
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
          userId: existingUser._id,
          changeTo: "editor",
        },
        pathParametersObject: {
          clubId: existingClub._id,
        },
      })

      const res = await changeAClubMemberRole.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith(existingClub._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid club")
    })
  })

  describe("Return 200 if valid request is made", () => {
    test("Should return 200 and update user role", async () => {
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
          changeTo: "editor",
        },
        pathParametersObject: {
          clubId: testClub._id,
        },
      })

      const res = await changeAClubMemberRole.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(testUser._id)
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith(testClub._id)
      expect(testUser).toMatchObject({
        ...existingUser,
        clubs: [
          {
            clubId: testClub._id,
            authorization: "editor",
          },
          {
            clubId: "randommongooseobjectid",
            authorization: "editor",
          },
        ],
      })
      expect(testClub).toMatchObject({
        ...existingClub,
        members: [
          {
            authorization: "editor",
            username: testUser.username,
            userId: testUser._id,
          },
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
      expect(JSON.parse(res.body).message).toBe("User role updated")
    })
  })
})

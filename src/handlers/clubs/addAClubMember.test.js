const addAClubMember = require("./addAClubMember")
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

describe("POST /clubs/{clubId}/members", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if userId isn't given", async () => {
      const event = eventGenerator({
        body: {},
        pathParametersObject: {
          clubId: "validClubId",
        },
      })

      const res = await addAClubMember.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if userId has no associated user", async () => {
      userUtil.DBFindUserById.mockImplementation(() => null)

      const event = eventGenerator({
        body: {
          userId: existingUser._id,
        },
        pathParametersObject: {
          clubId: "validClubId",
        },
      })

      const res = await addAClubMember.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid user")
    })

    test("Should return 400 if club has no associated club", async () => {
      userUtil.DBFindUserById.mockImplementation(() => existingUser)
      clubUtil.DBFindClubById.mockImplementation(() => null)

      const event = eventGenerator({
        body: {
          userId: existingUser._id,
        },
        pathParametersObject: {
          clubId: "invalidClubId",
        },
      })

      const res = await addAClubMember.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("invalidClubId")
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid club")
    })

    test("Should return 400 if user hasn't requested to join club", async () => {
      const testClub = {
        ...existingClub,
        userRequestingToJoinClub: [],
      }
      userUtil.DBFindUserById.mockImplementation(() => existingUser)
      clubUtil.DBFindClubById.mockImplementation(() => testClub)

      const event = eventGenerator({
        body: {
          userId: existingUser._id,
        },
        pathParametersObject: {
          clubId: testClub._id,
        },
      })

      const res = await addAClubMember.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith(testClub._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe(
        "User has not requested to join this club"
      )
    })
  })

  describe("Return 200 and add user to club if valid request is made", () => {
    test("Should return 200 and add user to club", async () => {
      const testUser = {
        ...existingUser,
        clubs: [],
        clubRequests: [
          {
            name: existingClub.name,
            clubId: existingClub._id,
          },
        ],
        save: jest.fn(),
      }
      const testClub = {
        ...existingClub,
        members: [],
        userRequestingToJoinClub: [
          {
            username: testUser.username,
            userId: testUser._id,
          },
        ],
        cyclistCount: 0,
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

      const res = await addAClubMember.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(testUser._id)
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith(testClub._id)
      expect(testClub).toMatchObject({
        ...testClub,
        members: [
          {
            username: testUser.username,
            userId: testUser._id,
          },
        ],
        userRequestingToJoinClub: [],
      })
      expect(testUser).toMatchObject({
        ...existingUser,
        clubs: [
          {
            authorization: "user",
            clubId: testClub._id,
          },
        ],
        clubRequests: [],
      })
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("User added to club")
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
          clubId: "validClubId",
        },
      })

      const res = await addAClubMember.handler(event, context)

      // mock
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding user")
    })
  })
})

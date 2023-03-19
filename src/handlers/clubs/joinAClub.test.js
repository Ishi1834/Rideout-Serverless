const joinAClub = require("./joinAClub")
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

describe("PATCH /clubs/{clubId}/join", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if clubId has no associated club", async () => {
      clubUtil.DBFindClubById.mockImplementation(() => null)
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "invalidClubId",
        },
      })

      const res = await joinAClub.handler(event, context)

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

      const res = await joinAClub.handler(event, context)

      // mock
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("validClubId")
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid user")
    })

    test("Should return 400 if user has already joined club", async () => {
      const testClub = {
        ...existingClub,
        members: [
          {
            username: existingUser.username,
            userId: existingUser._id,
          },
        ],
      }
      clubUtil.DBFindClubById.mockImplementation(() => testClub)
      userUtil.DBFindUserById.mockImplementation(() => existingUser)
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "validClubId",
        },
      })

      const res = await joinAClub.handler(event, context)

      // mock
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("validClubId")
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("User already joined club")
    })

    test("Should return 400 if user has requested to join club", async () => {
      const testClub = {
        ...existingClub,
        members: [],
        userRequestingToJoinClub: [
          {
            username: existingUser.username,
            userId: existingUser._id,
          },
        ],
      }
      clubUtil.DBFindClubById.mockImplementation(() => testClub)
      userUtil.DBFindUserById.mockImplementation(() => existingUser)
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "validClubId",
        },
      })

      const res = await joinAClub.handler(event, context)

      // mock
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("validClubId")
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe(
        "User already requested to join club"
      )
    })
  })

  describe("Return 200 if valid request is made", () => {
    test("Should add user to clubRequest and return 200", async () => {
      const testClub = {
        ...existingClub,
        members: [],
        userRequestingToJoinClub: [],
        save: jest.fn(),
      }
      const testUser = {
        ...existingUser,
        clubsRequests: [],
        save: jest.fn(),
      }
      clubUtil.DBFindClubById.mockImplementation(() => testClub)
      userUtil.DBFindUserById.mockImplementation(() => testUser)
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "validClubId",
        },
      })

      const res = await joinAClub.handler(event, context)

      // mock
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("validClubId")
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(testUser._id)
      expect(testClub).toMatchObject({
        ...existingClub,
        members: [],
        userRequestingToJoinClub: [
          {
            username: testUser.username,
            userId: testUser._id,
          },
        ],
      })
      expect(testUser).toMatchObject({
        ...existingUser,
        clubsRequests: [
          {
            name: testClub.name,
            clubId: testClub._id,
          },
        ],
      })
      expect(testClub.save).toHaveBeenCalledTimes(1)
      expect(testUser.save).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("Join request sent")
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

      const res = await joinAClub.handler(event, context)

      // mock
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("validClubId")
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding club")
    })
  })
})

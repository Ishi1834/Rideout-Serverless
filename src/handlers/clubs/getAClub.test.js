const getAClub = require("./getAClub")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const clubUtil = require("../../utils/database/clubs")
const {
  existingClub,
  existingUser,
  context: contextBase,
} = require("../../../tests/staticData")

jest.mock("../../utils/database/clubs")
jest.mock("../../config/dbConn")

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

describe("GET /clubs/{clubId}", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if clubId has no associated club", async () => {
      clubUtil.DBFindClubById.mockImplementation(() => null)
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "invalidClubId",
        },
      })

      const res = await getAClub.handler(event, context)

      // mock
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("invalidClubId")
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid club")
    })
  })

  describe("Return 200 if valid request is made", () => {
    test("Should return 200 and club", async () => {
      clubUtil.DBFindClubById.mockImplementation(() => existingClub)
      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
      })

      const res = await getAClub.handler(event, context)

      // mock
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith(existingClub._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual(existingClub)
    })
  })

  describe("Return 500 if there is an error", () => {
    test("Should return 500 and error message", async () => {
      clubUtil.DBFindClubById.mockImplementation(() => {
        throw new Error("Error finding club")
      })
      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
      })

      const res = await getAClub.handler(event, context)

      // mock
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith(existingClub._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding club")
    })
  })
})

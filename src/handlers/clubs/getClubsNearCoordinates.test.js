const getClubsNearCoordinates = require("./getClubsNearCoordinates")
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

describe("GET /clubs", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if lat evaluates to false", async () => {
      const event = eventGenerator({
        queryStringObject: {
          lat: "",
          lng: "100",
        },
      })

      const res = await getClubsNearCoordinates.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if lng evaluates to false", async () => {
      const event = eventGenerator({
        queryStringObject: {
          lat: "50",
          lng: "",
        },
      })

      const res = await getClubsNearCoordinates.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if maxDistance is less than 10,000", async () => {
      const event = eventGenerator({
        queryStringObject: {
          maxDistance: "100",
          lat: "50",
          lng: "100",
        },
      })

      const res = await getClubsNearCoordinates.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe(
        "MaxDistance should be greater than 10,000m"
      )
    })
  })

  describe("Return 200 if valid request is made", () => {
    test("Should return 200 and message if there are no clubs for given location", async () => {
      clubUtil.DBFindClubsNearCoordinates.mockImplementation(() => [])

      const event = eventGenerator({
        queryStringObject: {
          maxDistance: "30000",
          lat: "50",
          lng: "120",
        },
      })

      const res = await getClubsNearCoordinates.handler(event, context)

      // mocks
      expect(clubUtil.DBFindClubsNearCoordinates).toHaveBeenCalledWith(
        30000,
        120,
        50
      )
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe(
        "No clubs found near coordinates"
      )
    })

    test("Should return 200 and clubs if clubs for given location", async () => {
      clubUtil.DBFindClubsNearCoordinates.mockImplementation(() => [
        existingClub,
      ])

      const event = eventGenerator({
        queryStringObject: {
          maxDistance: "30000",
          lat: "50",
          lng: "120",
        },
      })

      const res = await getClubsNearCoordinates.handler(event, context)

      // mocks
      expect(clubUtil.DBFindClubsNearCoordinates).toHaveBeenCalledWith(
        30000,
        120,
        50
      )
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual([existingClub])
    })
  })
})

const getClubRides = require("./getClubRides")
const eventGenerator = require("../../tests/utils/eventGenerator")
const validators = require("../../tests/utils/validators")
const rideUtil = require("../../utils/database/rides")
const {
  existingClub,
  existingUser,
  existingRide,
  context: contextBase,
} = require("../../tests/staticData")

jest.mock("../../utils/database/rides")

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

describe("GET /clubs/{clubId}/rides", () => {
  describe("Return 200 if request is valid", () => {
    test("Should return 200 and message if club has no rides", async () => {
      rideUtil.DBFindUpcomingRidesByClubId.mockImplementation(() => [])

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
      })

      const res = await getClubRides.handler(event, context)

      // mock
      expect(rideUtil.DBFindUpcomingRidesByClubId).toHaveBeenCalledWith(
        existingClub._id
      )
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("There are no upcoming rides")
    })

    test("Should return 200 and rides array if club has rides", async () => {
      rideUtil.DBFindUpcomingRidesByClubId.mockImplementation(() => [
        existingRide,
      ])

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
      })

      const res = await getClubRides.handler(event, context)

      // mock
      expect(rideUtil.DBFindUpcomingRidesByClubId).toHaveBeenCalledWith(
        existingClub._id
      )
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual([existingRide])
    })
  })

  describe("Return 500 if there is an error", () => {
    test("Should return 500 and error message", async () => {
      rideUtil.DBFindUpcomingRidesByClubId.mockImplementation(() => {
        throw new Error("Error finding rides")
      })

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
      })

      const res = await getClubRides.handler(event, context)

      // mock
      expect(rideUtil.DBFindUpcomingRidesByClubId).toHaveBeenCalledWith(
        existingClub._id
      )
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding rides")
    })
  })
})

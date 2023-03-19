const createAClubRide = require("./createAClubRide")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const clubUtil = require("../../utils/database/clubs")
const rideUtil = require("../../utils/database/rides")
const userUtil = require("../../utils/database/users")
const {
  existingClub,
  existingUser,
  existingRide,
  context: contextBase,
} = require("../../../tests/staticData")

jest.mock("../../utils/database/clubs")
jest.mock("../../utils/database/users")
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

describe("POST /clubs/{clubId}/rides", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if name evaluates to false", async () => {
      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
        body: {
          name: "",
          date: "random date",
          startLocation: [50, 40],
          rideType: "social",
          distance: 40,
          speed: 25,
          description: "Weekend social",
        },
      })

      const res = await createAClubRide.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if date evaluates to false", async () => {
      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
        body: {
          name: "name",
          date: "",
          startLocation: [50, 40],
          rideType: "social",
          distance: 40,
          speed: 25,
          description: "Weekend social",
        },
      })

      const res = await createAClubRide.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if startLocation isn't an array", async () => {
      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
        body: {
          name: "name",
          date: "date",
          startLocation: "",
          rideType: "social",
          distance: 40,
          speed: 25,
          description: "Weekend social",
        },
      })

      const res = await createAClubRide.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if startLocation doesn't have 2 number", async () => {
      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
        body: {
          name: "name",
          date: "date",
          startLocation: [],
          rideType: "social",
          distance: 40,
          speed: 25,
          description: "Weekend social",
        },
      })

      const res = await createAClubRide.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if rideType evaluates to false", async () => {
      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
        body: {
          name: "name",
          date: "date",
          startLocation: [40, 40],
          rideType: "",
          distance: 40,
          speed: 25,
          description: "Weekend social",
        },
      })

      const res = await createAClubRide.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if distance evaluates to false", async () => {
      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
        body: {
          name: "name",
          date: "date",
          startLocation: [40, 40],
          rideType: "social",
          distance: "",
          speed: 25,
          description: "Weekend social",
        },
      })

      const res = await createAClubRide.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if speed evaluates to false", async () => {
      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
        body: {
          name: "name",
          date: "date",
          startLocation: [40, 40],
          rideType: "social",
          distance: 40,
          speed: "",
          description: "Weekend social",
        },
      })

      const res = await createAClubRide.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if description evaluates to false", async () => {
      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
        body: {
          name: "name",
          date: "date",
          startLocation: [40, 40],
          rideType: "social",
          distance: 40,
          speed: 25,
          description: "",
        },
      })

      const res = await createAClubRide.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if userId has no associated user", async () => {
      userUtil.DBFindUserById.mockImplementation(() => null)

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
        body: {
          name: "name",
          date: "date",
          startLocation: [40, 40],
          rideType: "social",
          distance: 40,
          speed: 25,
          description: "ride description",
        },
      })

      const res = await createAClubRide.handler(event, context)

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
        pathParametersObject: {
          clubId: existingClub._id,
        },
        body: {
          name: "name",
          date: "date",
          startLocation: [40, 40],
          rideType: "social",
          distance: 40,
          speed: 25,
          description: "ride description",
        },
      })

      const res = await createAClubRide.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith(existingClub._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid club")
    })
  })

  describe("Should return 200 if valid request is made", () => {
    test("Should return 200 and create ride", async () => {
      const testUser = {
        ...existingUser,
        rides: [],
        save: jest.fn(),
      }
      const testClub = {
        ...existingClub,
        rides: [],
        save: jest.fn(),
      }
      userUtil.DBFindUserById.mockImplementation(() => testUser)
      clubUtil.DBFindClubById.mockImplementation(() => testClub)
      rideUtil.DBCreateRide.mockImplementation(() => existingRide)

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
        body: {
          name: "name",
          date: "date",
          startLocation: [40, 40],
          rideType: "social",
          distance: 40,
          speed: 25,
          description: "description",
        },
      })

      const res = await createAClubRide.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith(existingClub._id)
      expect(rideUtil.DBCreateRide).toHaveBeenCalledWith({
        name: "name",
        createdBy: {
          username: existingUser.username,
          userId: existingUser._id,
        },
        clubId: existingClub._id,
        date: "date",
        openRide: false,
        startLocation: {
          type: "Point",
          coordinates: [40, 40],
        },
        rideType: "social",
        signedUpCyclists: [
          {
            username: existingUser.username,
            userId: existingUser._id,
          },
        ],
        distance: 40,
        speed: 25,
        description: "description",
        cafeStops: "No stops given",
        route: "No route given",
      })
      expect(testUser).toMatchObject({
        ...existingUser,
        rides: [existingRide._id],
      })
      expect(testClub).toMatchObject({
        ...existingClub,
        rides: [existingRide._id],
      })
      expect(testUser.save).toHaveBeenCalledTimes(1)
      expect(testClub.save).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(201)
      expect(JSON.parse(res.body)).toEqual({
        message: "Ride created",
        ride: existingRide,
      })
    })
  })

  describe("Return 500 if there is an error", () => {
    test("Should return 500 and error message", async () => {
      userUtil.DBFindUserById.mockImplementation(() => {
        throw new Error("Error finding user")
      })

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
        body: {
          name: "name",
          date: "date",
          startLocation: [40, 40],
          rideType: "social",
          distance: 40,
          speed: 25,
          description: "ride description",
        },
      })

      const res = await createAClubRide.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding user")
    })
  })
})

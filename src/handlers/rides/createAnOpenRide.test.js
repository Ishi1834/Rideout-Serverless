const createAnOpenRide = require("./createAnOpenRide")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const rideUtil = require("../../utils/database/rides")
const userUtil = require("../../utils/database/users")
const {
  existingUser,
  existingRide,
  context: contextBase,
} = require("../../../tests/staticData")

jest.mock("../../utils/database/users")
jest.mock("../../utils/database/rides")

const context = {
  ...contextBase,
  prev: {
    userId: existingUser._id,
  },
}

afterEach(() => {
  jest.resetAllMocks()
})

describe("POST /rides", () => {
  describe("Return 400 if request isn't valid", () => {
    const requiredFields = {
      name: "name",
      date: "random date",
      startLocation: [50, 40],
      rideType: "social",
      distance: 40,
      speed: 25,
      description: "Weekend social",
    }

    for (const property in requiredFields) {
      test(`Should return 400 if ${property} evaluates to false`, async () => {
        const event = eventGenerator({
          body: {
            name: property !== "name" && requiredFields["name"],
            date: property !== "date" && requiredFields["date"],
            startLocation:
              property !== "startLocation" && requiredFields["startLocation"],
            rideType: property !== "rideType" && requiredFields["rideType"],
            distance: property !== "distance" && requiredFields["distance"],
            speed: property !== "speed" && requiredFields["speed"],
            description:
              property !== "description" && requiredFields["description"],
          },
        })

        const res = await createAnOpenRide.handler(event, context)

        // response
        expect(validators.isApiGatewayResponse(res)).toBe(true)
        expect(res.statusCode).toBe(400)
        expect(JSON.parse(res.body).message).toBe("All fields are required")
      })
    }

    test("Should return 400 if userId has no associated user", async () => {
      userUtil.DBFindUserById.mockImplementation(() => null)
      const event = eventGenerator({
        body: requiredFields,
      })

      const res = await createAnOpenRide.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid user")
    })
  })

  describe("Return 200 if valid request is made", () => {
    test("Should return 200 and create ride", async () => {
      const testRide = {
        ...existingRide,
        openRide: true,
      }
      const testUser = {
        ...existingUser,
        rides: [],
        save: jest.fn(),
      }
      rideUtil.DBCreateRide.mockImplementation(() => testRide)
      userUtil.DBFindUserById.mockImplementation(() => testUser)

      const event = eventGenerator({
        body: {
          name: "name",
          date: "date",
          startLocation: [40, 60],
          rideType: "social",
          distance: 40,
          speed: 25,
          description: "description",
        },
      })

      const res = await createAnOpenRide.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(testUser._id)
      expect(rideUtil.DBCreateRide).toHaveBeenCalledWith({
        name: "name",
        date: "date",
        createdBy: {
          username: testUser.username,
          userId: testUser._id,
        },
        openRide: true,
        startLocation: {
          type: "Point",
          coordinates: existingRide.startLocation.coordinates,
        },
        signedUpCyclists: [
          {
            username: testUser.username,
            userId: testUser._id,
          },
        ],
        rideType: "social",
        distance: 40,
        speed: 25,
        description: "description",
        cafeStops: "No stops given",
        route: "No route given",
      })
      expect(testUser).toMatchObject({
        ...existingUser,
        rides: [testRide._id],
      })
      expect(testUser.save).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(201)
      expect(JSON.parse(res.body)).toEqual({
        message: "Ride created",
        ride: {
          ...existingRide,
          openRide: true,
        },
      })
    })
  })

  describe("Return 500 if there is an error", () => {
    test("Should return 500 and error message", async () => {
      userUtil.DBFindUserById.mockImplementation(() => {
        throw new Error("Error finding user")
      })

      const event = eventGenerator({
        body: {
          name: "name",
          date: "date",
          startLocation: [40, 60],
          rideType: "social",
          distance: 40,
          speed: 25,
          description: "description",
        },
      })

      const res = await createAnOpenRide.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding user")
    })
  })
})

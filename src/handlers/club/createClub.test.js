const createClub = require("./createClub")
const eventGenerator = require("../../tests/utils/eventGenerator")
const validators = require("../../tests/utils/validators")
const userUtil = require("../../utils/database/users")
const clubUtil = require("../../utils/database/clubs")
const {
  existingUser,
  existingClub,
  context: contextBase,
} = require("../../tests/staticData")

jest.mock("../../utils/database/users")
jest.mock("../../utils/database/clubs")

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

describe("POST /clubs", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if all required fields aren't given", async () => {
      const event = eventGenerator({
        body: {},
      })

      const res = await createClub.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if name evaluates to false", async () => {
      const event = eventGenerator({
        body: {
          name: "",
          location: [60, 60],
          city: "London",
        },
      })

      const res = await createClub.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if location doesn't isn't an array of 2 values", async () => {
      const event = eventGenerator({
        body: {
          name: "Cycling club",
          location: [],
          city: "London",
        },
      })

      const res = await createClub.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if city evaluates to false", async () => {
      const event = eventGenerator({
        body: {
          name: "Cycling club",
          location: [60, 60],
          city: "",
        },
      })

      const res = await createClub.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if userId has no associated user", async () => {
      userUtil.findUserById.mockImplementation(() => null)
      const event = eventGenerator({
        body: {
          name: "Cycling club",
          location: [60, 60],
          city: "London",
        },
      })

      const res = await createClub.handler(event, context)

      // mock
      expect(userUtil.findUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid user")
    })
  })

  describe("Return 200 if valid request is made", () => {
    test("Should return 200 and club object if club is created successfully", async () => {
      const testUser = { ...existingUser, save: jest.fn() }
      const testClub = { ...existingClub, members: [] }
      userUtil.findUserById.mockImplementation(() => testUser)
      clubUtil.createClub.mockImplementation(() => existingClub)

      const event = eventGenerator({
        body: {
          name: existingClub.name,
          location: existingClub.location.coordinates,
          city: existingClub.city,
        },
      })

      const res = await createClub.handler(event, context)

      // mock
      expect(userUtil.findUserById).toHaveBeenCalledWith(existingUser._id)
      expect(clubUtil.createClub).toHaveBeenCalledWith({
        name: testClub.name,
        location: {
          type: "Point",
          coordinates: testClub.location.coordinates,
        },
        city: testClub.city,
        members: [
          {
            username: testUser.username,
            userId: testUser._id,
            authorization: "admin",
          },
        ],
      })
      expect(testUser.clubs).toEqual([
        {
          authorization: "admin",
          clubId: testClub._id,
        },
      ])
      expect(testUser.save).toHaveBeenCalledTimes(1)
      // response
      console.log("club", existingClub)
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(201)
      expect(JSON.parse(res.body)).toEqual({
        message: "Club created",
        club: existingClub,
      })
    })
  })

  describe("Return 500 if there is an error creating club", () => {
    test("Should return 500 and error message", async () => {
      userUtil.findUserById.mockImplementation(() => {
        throw new Error("Error finding user")
      })
      const event = eventGenerator({
        body: {
          name: "Cycling club",
          location: [60, 60],
          city: "London",
        },
      })

      const res = await createClub.handler(event, context)

      // mock
      expect(userUtil.findUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding user")
    })
  })
})

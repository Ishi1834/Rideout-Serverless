const createClub = require("./createClub")
const eventGenerator = require("../../tests/utils/eventGenerator")
const validators = require("../../tests/utils/validators")
const userUtil = require("../../utils/database/users")
const { existingUser, context: contextBase } = require("../../tests/staticData")

jest.mock("../../utils/database/users")

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
})

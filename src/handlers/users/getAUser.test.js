const getAUser = require("./getAUser")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const userUtil = require("../../utils/database/users")
const {
  existingUser,
  context: contextBase,
} = require("../../../tests/staticData")

jest.mock("../../utils/database/users")

const context = {
  ...contextBase,
  prev: {
    userId: existingUser._id,
  },
}

afterEach(() => {
  jest.resetAllMocks()
})

describe("GET /users/{userId}", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if userId has no associated user", async () => {
      userUtil.DBFindUserById.mockImplementation(() => null)

      const event = eventGenerator({
        body: {},
        pathParametersObject: {
          userId: "invalidUserId",
        },
      })

      const res = await getAUser.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith("invalidUserId")
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid user")
    })
  })

  describe("Return 200 if request is valid", () => {
    test("Should return 200 and user", async () => {
      userUtil.DBFindUserById.mockImplementation(() => existingUser)

      const event = eventGenerator({
        body: {},
        pathParametersObject: {
          userId: existingUser._id,
        },
      })

      const res = await getAUser.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual(existingUser)
    })
  })

  describe("Return 500 if there is an error", () => {
    test("Should return 500 and error message", async () => {
      userUtil.DBFindUserById.mockImplementation(() => {
        throw new Error("Error finding user")
      })

      const event = eventGenerator({
        body: {},
        pathParametersObject: {
          userId: existingUser._id,
        },
      })

      const res = await getAUser.handler(event, context)

      // mocks
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding user")
    })
  })
})

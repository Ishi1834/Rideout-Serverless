const refresh = require("./refresh")
const eventGenerator = require("../../tests/utils/eventGenerator")
const validators = require("../../tests/utils/validators")
const userUtil = require("../../utils/database/users")
const jwt = require("jsonwebtoken")

jest.mock("jsonwebtoken")
jest.mock("../../utils/database/users")

function TestError(name, message) {
  this.message = message || ""
  this.name = name
}

const context = {
  callbackWaitsForEmptyEventLoop: true,
}

afterEach(() => {
  jest.resetAllMocks()
})

describe("POST /auth/refresh", () => {
  describe("Return 400 if missing required fields", () => {
    test("Should return 400 if all required fields are undefined", async () => {
      const event = eventGenerator({
        body: {},
      })

      const res = await refresh.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if refreshToken is evaluates to false", async () => {
      const event = eventGenerator({
        body: {
          refreshToken: "",
        },
      })

      const res = await refresh.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })
  })

  describe("Return 401 if invalid refreshToken is given", () => {
    test("Should return 401 if JWT verify is returns an error", async () => {
      jwt.verify.mockImplementation(() => {
        throw new TestError("JsonWebTokenError")
      })

      const event = eventGenerator({
        body: {
          refreshToken: "invalidToken",
        },
      })

      const res = await refresh.handler(event, context)
      console.log("res ", res)
      // mock
      expect(jwt.verify).toHaveBeenCalledWith(
        "invalidToken",
        "refreshTokenSecret"
      )
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(401)
      expect(JSON.parse(res.body).message).toBe("Invalid refreshToken")
    })

    test("Should return 401 if userId from JWT verify no longer exists", async () => {
      jwt.verify.mockImplementation(() => {
        return {
          userId: "1234567891112",
        }
      })
      userUtil.findUserById.mockImplementation(() => null)

      const event = eventGenerator({
        body: {
          refreshToken: "validToken",
        },
      })

      const res = await refresh.handler(event, context)

      // mock
      expect(jwt.verify).toHaveBeenCalledWith(
        "validToken",
        "refreshTokenSecret"
      )
      expect(userUtil.findUserById).toHaveBeenCalledWith("1234567891112")
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(401)
      expect(JSON.parse(res.body).message).toBe("Invalid token user")
    })
  })
})

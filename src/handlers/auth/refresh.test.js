const refresh = require("./refresh")
const eventGenerator = require("../../tests/utils/eventGenerator")
const validators = require("../../tests/utils/validators")
const userUtil = require("../../utils/database/users")
const jwt = require("jsonwebtoken")

jest.mock("jsonwebtoken")

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
    test("Should return 401 if refreshToken is malformed", async () => {
      const event = eventGenerator({
        body: {
          refreshToken: "invalidToken",
        },
      })

      const res = await refresh.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(401)
      expect(JSON.parse(res.body).message).toBe("Invalid refreshToken")
    })

    //test("Should return 401 if refreshToken has expired", async () => {})
  })
})

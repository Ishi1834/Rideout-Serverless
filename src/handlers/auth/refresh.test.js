const refresh = require("./refresh")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const userUtil = require("../../utils/database/users")
const jwt = require("jsonwebtoken")
const {
  context,
  existingUser,
  existingUserJWTAuthProps,
  existingUserJWTRefreshProps,
} = require("../../../tests/staticData")

jest.mock("jsonwebtoken")
jest.mock("../../utils/database/users")
jest.mock("../../config/dbConn")

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
    test("Should return 401 if userId from JWT verify no longer exists", async () => {
      jwt.verify.mockImplementation(() => {
        return {
          userId: existingUser._id,
        }
      })
      userUtil.DBFindUserById.mockImplementation(() => null)

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
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(401)
      expect(JSON.parse(res.body).message).toBe("Invalid token user")
    })
  })

  describe("Return 200 if correct details are given", () => {
    test("Should return authToken, refreshToken and 200", async () => {
      jwt.verify.mockImplementation(() => {
        return {
          userId: existingUser._id,
        }
      })
      userUtil.DBFindUserById.mockImplementation(() => existingUser)
      jwt.sign
        .mockImplementationOnce(() => "authToken")
        .mockImplementationOnce(() => "refreshToken")

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
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      expect(jwt.sign).toHaveBeenCalledTimes(2)
      expect(jwt.sign).toHaveBeenNthCalledWith(1, ...existingUserJWTAuthProps)
      expect(jwt.sign).toHaveBeenNthCalledWith(
        2,
        ...existingUserJWTRefreshProps
      )
      //
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual({
        userId: existingUser._id,
        authToken: "authToken",
        refreshToken: "refreshToken",
      })
    })
  })
})

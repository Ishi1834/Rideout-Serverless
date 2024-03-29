const login = require("./login")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const userUtil = require("../../utils/database/users")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {
  existingUser,
  existingUserJWTAuthProps,
  existingUserJWTRefreshProps,
  context,
} = require("../../../tests/staticData")

jest.mock("../../utils/database/users")
jest.mock("bcrypt")
jest.mock("jsonwebtoken")
jest.mock("../../config/dbConn")

describe("POST /auth/login", () => {
  describe("Return 400 if missing required fields", () => {
    test("Should return 400 if all required fields are undefined", async () => {
      const event = eventGenerator({
        body: {},
      })

      const res = await login.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if username is evaluates to false", async () => {
      const event = eventGenerator({
        body: {
          username: "",
          password: "password",
        },
      })

      const res = await login.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if password is evaluates to false", async () => {
      const event = eventGenerator({
        body: {
          username: "username",
          password: "",
        },
      })

      const res = await login.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })
  })

  describe("Return 401 if invalid details are given", () => {
    test("Should return 401 if username doesn't exist", async () => {
      userUtil.DBFindUser.mockImplementation(() => null)

      const event = eventGenerator({
        body: {
          username: "username",
          password: "password",
        },
      })

      const res = await login.handler(event, context)

      // mock
      expect(userUtil.DBFindUser).toHaveBeenCalledWith({ username: "username" })
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(401)
      expect(JSON.parse(res.body).message).toBe("Invalid username")
    })

    test("Should return 401 if password doesn't match", async () => {
      userUtil.DBFindUser.mockImplementation(() => existingUser)
      bcrypt.compare.mockImplementation(() => false)

      const event = eventGenerator({
        body: {
          username: "username",
          password: "wrongPassword",
        },
      })

      const res = await login.handler(event, context)

      // mock
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrongPassword",
        existingUser.password
      )
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(401)
      expect(JSON.parse(res.body).message).toBe("Invalid password")
    })
  })

  describe("Return 200 if correct details are given", () => {
    test("Should return authToken, refreshToken and 200", async () => {
      userUtil.DBFindUser.mockImplementation(() => existingUser)
      bcrypt.compare.mockImplementation(() => true)
      jwt.sign
        .mockImplementationOnce(() => "authToken")
        .mockImplementationOnce(() => "refreshToken")

      const event = eventGenerator({
        body: {
          username: "username",
          password: "password",
        },
      })

      const res = await login.handler(event, context)

      // mock
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password",
        existingUser.password
      )
      expect(jwt.sign).toHaveBeenCalledTimes(2)
      expect(jwt.sign).toHaveBeenNthCalledWith(
        1,
        existingUserJWTAuthProps[0],
        existingUserJWTAuthProps[1],
        existingUserJWTAuthProps[2]
      )
      expect(jwt.sign).toHaveBeenNthCalledWith(
        2,
        existingUserJWTRefreshProps[0],
        existingUserJWTRefreshProps[1],
        existingUserJWTRefreshProps[2]
      )
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual({
        authenticated: true,
        userId: existingUser._id,
        authToken: "authToken",
        refreshToken: "refreshToken",
      })
    })
  })
})

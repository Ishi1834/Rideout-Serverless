const verifyEmailToken = require("./verifyEmailToken")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const userUtil = require("../../utils/database/users")
const jwt = require("jsonwebtoken")
const {
  context,
  existingUser,
  nonExistingUserId,
} = require("../../../tests/staticData")

jest.mock("../../utils/database/users")
jest.mock("jsonwebtoken")
jest.mock("../../config/dbConn")

function TestError(name, message) {
  this.message = message || ""
  this.name = name
}

afterEach(() => {
  jest.resetAllMocks()
})

describe("GET /account/verification/:verificationToken", () => {
  describe("Return 401 if request is unauthorized", () => {
    test("Should return 401 if verificationToken is invalid", async () => {
      jwt.verify.mockImplementation(() => {
        throw new TestError("JsonWebTokenError")
      })
      const event = eventGenerator({
        pathParametersObject: {
          verificationToken: "invalidRefreshToken",
        },
      })

      const res = await verifyEmailToken.handler(event, context)

      // mock
      expect(jwt.verify).toHaveBeenCalledWith(
        "invalidRefreshToken",
        "verificationTokenSecret"
      )
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(401)
      expect(JSON.parse(res.body).message).toBe("Invalid verificationToken")
    })

    test("Should return 401 if user for verificationToken no longer exists", async () => {
      jwt.verify.mockImplementation(() => {
        return {
          userId: nonExistingUserId,
        }
      })
      userUtil.DBFindUserById.mockImplementation(() => null)
      const event = eventGenerator({
        pathParametersObject: {
          verificationToken: "validRefreshToken",
        },
      })

      const res = await verifyEmailToken.handler(event, context)

      // mock
      expect(jwt.verify).toHaveBeenCalledWith(
        "validRefreshToken",
        "verificationTokenSecret"
      )
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(nonExistingUserId)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(401)
      expect(JSON.parse(res.body).message).toBe("Invalid userId")
    })

    test("Should return 401 if user fo verificationToken is verified", async () => {
      jwt.verify.mockImplementation(() => {
        return {
          userId: existingUser._id,
        }
      })
      userUtil.DBFindUserById.mockImplementation(() => {
        return { ...existingUser, emailVerified: true }
      })
      const event = eventGenerator({
        pathParametersObject: {
          verificationToken: "validRefreshToken",
        },
      })

      const res = await verifyEmailToken.handler(event, context)

      // mock
      expect(jwt.verify).toHaveBeenCalledWith(
        "validRefreshToken",
        "verificationTokenSecret"
      )
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(401)
      expect(JSON.parse(res.body).message).toBe("Email verified")
    })
  })

  describe("Return 200 if correct details are given", () => {
    test("Should return 200 if verificationToken is valid, and user hasn't already verified", async () => {
      const testUser = {
        ...existingUser,
        emailVerified: false,
        save: jest.fn(),
      }
      jwt.verify.mockImplementation(() => {
        return {
          userId: existingUser._id,
        }
      })
      userUtil.DBFindUserById.mockImplementation(() => testUser)

      const event = eventGenerator({
        pathParametersObject: {
          verificationToken: "validRefreshToken",
        },
      })

      const res = await verifyEmailToken.handler(event, context)

      // mock
      expect(jwt.verify).toHaveBeenCalledWith(
        "validRefreshToken",
        "verificationTokenSecret"
      )
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      expect(testUser).toMatchObject({
        ...existingUser,
        emailVerified: true,
      })
      expect(testUser.save).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("Email verified")
    })
  })

  describe("Return 500 if there is an error with database", () => {
    test("Should return 500 if there is an error saving user", async () => {
      const testUser = {
        ...existingUser,
        emailVerified: false,
        save: jest.fn(),
      }
      jwt.verify.mockImplementation(() => {
        return {
          userId: existingUser._id,
        }
      })
      userUtil.DBFindUserById.mockImplementation(() => testUser)
      testUser.save.mockImplementation(() => {
        throw new Error("Error saving changes")
      })

      const event = eventGenerator({
        pathParametersObject: {
          verificationToken: "validRefreshToken",
        },
      })

      const res = await verifyEmailToken.handler(event, context)

      // mock
      expect(jwt.verify).toHaveBeenCalledWith(
        "validRefreshToken",
        "verificationTokenSecret"
      )
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(existingUser._id)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error saving changes")
    })
  })
})

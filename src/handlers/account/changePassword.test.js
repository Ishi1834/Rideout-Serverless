const changePassword = require("./changePassword")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const bcrypt = require("bcrypt")
const userUtil = require("../../utils/database/users")
const validators = require("../../../tests/utils/validators")
const {
  context: contextBase,
  existingUser,
} = require("../../../tests/staticData")

jest.mock("bcrypt")
jest.mock("../../utils/database/users")
jest.mock("../../config/dbConn")

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

describe("POST /account/changePassword", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if all required fields aren't given", async () => {
      const event = eventGenerator({
        body: {},
      })

      const res = await changePassword.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if password evaluates to false", async () => {
      const event = eventGenerator({
        body: {
          password: "",
          newPassword: "newPassword",
        },
      })

      const res = await changePassword.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if all required fields aren't given", async () => {
      const event = eventGenerator({
        body: {
          password: "password",
          newPassword: "",
        },
      })

      const res = await changePassword.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if userId has no associated user in db", async () => {
      userUtil.DBFindUserById.mockImplementation(() => null)
      const event = eventGenerator({
        body: {
          password: "password",
          newPassword: "newPassword",
        },
      })

      const res = await changePassword.handler(event, context)

      // mock
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(context.prev.userId)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid user")
    })
  })

  describe("Return 401 if wrong password is given", () => {
    test("Should return 401 if password given doesn't match password in database", async () => {
      userUtil.DBFindUserById.mockImplementation(() => existingUser)
      bcrypt.compare.mockImplementation(() => false)
      const event = eventGenerator({
        body: {
          password: "incorrectPassword",
          newPassword: "newPassword",
        },
      })

      const res = await changePassword.handler(event, context)

      // mock
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(context.prev.userId)
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "incorrectPassword",
        existingUser.password
      )
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(401)
      expect(JSON.parse(res.body).message).toBe("Invalid password")
    })
  })

  describe("Return 200 if valid password is given", () => {
    test("Should return 200 and update password if valid current password is given", async () => {
      const testUser = {
        ...existingUser,
        save: jest.fn(),
      }
      userUtil.DBFindUserById.mockImplementation(() => testUser)
      bcrypt.compare.mockImplementation(() => true)
      bcrypt.hash.mockImplementation(() => "hashedNewPassword")

      const event = eventGenerator({
        body: {
          password: "password",
          newPassword: "newPassword",
        },
      })

      const res = await changePassword.handler(event, context)

      // mock
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(context.prev.userId)
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password",
        existingUser.password
      )
      expect(bcrypt.hash).toHaveBeenCalledWith("newPassword", 10)
      expect(testUser.save).toHaveBeenCalledTimes(1)
      expect(testUser).toMatchObject({
        ...existingUser,
        password: "hashedNewPassword",
      })
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("Password changed")
    })
  })

  describe("Return 500 if there is an error", () => {
    test("Should return 500 if there is an error in DBFindUserById", async () => {
      userUtil.DBFindUserById.mockImplementation(() => {
        throw new Error("Error getting user")
      })
      const event = eventGenerator({
        body: {
          password: "password",
          newPassword: "newPassword",
        },
      })

      const res = await changePassword.handler(event, context)

      // mock
      expect(userUtil.DBFindUserById).toHaveBeenCalledWith(context.prev.userId)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error getting user")
    })
  })
})

const resetPassword = require("./resetPassword")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const userUtil = require("../../utils/database/users")
const sendEmail = require("../../utils/sendEmail")
const generator = require("generate-password")
const bcrypt = require("bcrypt")
const { context, existingUser } = require("../../../tests/staticData")
const { generatePasswordResetContent } = require("../../utils/emailContent")

jest.mock("../../utils/database/users")
jest.mock("../../utils/sendEmail")
jest.mock("generate-password")
jest.mock("bcrypt")
jest.mock("../../config/dbConn")

describe("POST /account/passwordReset", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if all required fields are undefined", async () => {
      const event = eventGenerator({
        body: {},
      })

      const res = await resetPassword.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if username evaluates to false", async () => {
      const event = eventGenerator({
        body: {
          username: "",
        },
      })

      const res = await resetPassword.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if username has no associated user", async () => {
      userUtil.DBFindUser.mockImplementation(() => null)
      const event = eventGenerator({
        body: {
          username: "username",
        },
      })

      const res = await resetPassword.handler(event, context)

      // mock
      expect(userUtil.DBFindUser).toHaveBeenCalledWith({ username: "username" })
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid username")
    })
  })

  describe("Return 200 if request is valid", () => {
    test("Should return 200 and send email with temporary password", async () => {
      const testUser = {
        ...existingUser,
        save: () => true,
      }
      userUtil.DBFindUser.mockImplementation(() => testUser)
      generator.generate.mockImplementation(() => "temporaryPassword")
      sendEmail.mockImplementation(() => "success")
      bcrypt.hash.mockImplementation(() => "hashedTemporayPassword")
      const event = eventGenerator({
        body: {
          username: existingUser.username,
        },
      })

      const res = await resetPassword.handler(event, context)
      // mock
      expect(userUtil.DBFindUser).toHaveBeenCalledWith({
        username: existingUser.username,
      })
      expect(generator.generate).toHaveBeenCalledWith({
        length: 10,
        numbers: true,
      })
      expect(sendEmail).toHaveBeenCalledWith(
        existingUser.email,
        "Reset your password",
        generatePasswordResetContent(existingUser.name, "temporaryPassword")
      )
      expect(bcrypt.hash).toHaveBeenCalledWith("temporaryPassword", 10)
      expect(testUser).toMatchObject({
        ...existingUser,
        password: "hashedTemporayPassword",
      })
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("Email sent")
    })
  })
})

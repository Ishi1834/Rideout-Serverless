const sendVerificationEmail = require("./sendVerificationEmail")
const eventGenerator = require("../../tests/utils/eventGenerator")
const validators = require("../../tests/utils/validators")
const userUtil = require("../../utils/database/users")
const jwt = require("jsonwebtoken")
const sendEmail = require("../../utils/sendEmail")
const {
  context,
  existingUser,
  nonExistingUserId,
} = require("../../tests/staticData")
const { generateVerificationContent } = require("../../utils/emailContent")

jest.mock("../../utils/database/users")
jest.mock("jsonwebtoken")
jest.mock("../../utils/sendEmail")

afterEach(() => {
  jest.resetAllMocks()
})

describe("POST /account/verification", () => {
  describe("Return 400 if missing required fields", () => {
    test("Should return 400 if all required fields are undefined", async () => {
      const event = eventGenerator({
        body: {},
      })

      const res = await sendVerificationEmail.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if userId evaluates to false", async () => {
      const event = eventGenerator({
        body: {
          userId: "",
        },
      })

      const res = await sendVerificationEmail.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if userId has no associated user", async () => {
      userUtil.findUserById.mockImplementation(() => null)

      const event = eventGenerator({
        body: {
          userId: nonExistingUserId,
        },
      })

      const res = await sendVerificationEmail.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid userId")
    })
  })

  describe("Return 200 if correct email is sent", () => {
    test("Should return 200 and message", async () => {
      userUtil.findUserById.mockImplementation(() => existingUser)
      jwt.sign.mockImplementationOnce(() => "verificationToken")
      sendEmail.mockImplementation(() => "success")

      const event = eventGenerator({
        body: {
          userId: existingUser._id,
        },
      })

      const res = await sendVerificationEmail.handler(event, context)

      // mocks
      expect(userUtil.findUserById).toHaveBeenCalledWith(existingUser._id)
      expect(sendEmail).toHaveBeenCalledWith(
        existingUser.email,
        "Confirm your email",
        generateVerificationContent(
          existingUser.name,
          `https://localhost:3000/account/verification/verificationToken`
        )
      )
      // here
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body).message).toBe("Email has been sent")
    })
  })

  describe("Return 500 if there is an error sending verification email", () => {
    test("Should return 500 and error message", async () => {
      userUtil.findUserById.mockImplementation(() => existingUser)
      jwt.sign.mockImplementationOnce(() => "verificationToken")
      sendEmail.mockImplementation(() => {
        throw new Error("Error sending email")
      })

      const event = eventGenerator({
        body: {
          userId: existingUser._id,
        },
      })

      const res = await sendVerificationEmail.handler(event, context)

      // mocks
      expect(userUtil.findUserById).toHaveBeenCalledWith(existingUser._id)
      expect(sendEmail).toHaveBeenCalledWith(
        existingUser.email,
        "Confirm your email",
        generateVerificationContent(
          existingUser.name,
          `https://localhost:3000/account/verification/verificationToken`
        )
      )
      // here
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error sending email")
    })
  })
})

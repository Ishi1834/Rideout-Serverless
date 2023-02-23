const sendVerificationEmail = require("./sendVerificationEmail")
const eventGenerator = require("../../tests/utils/eventGenerator")
const validators = require("../../tests/utils/validators")
const userUtil = require("../../utils/database/users")

jest.mock("../../utils/database/users")

const context = {
  callbackWaitsForEmptyEventLoop: true,
}

const existingUser = {
  _id: "9834832903190321",
  username: "username",
  password: "password",
  clubs: [],
  rides: [],
}

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
  })
})

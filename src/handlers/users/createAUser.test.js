const createAUser = require("./createAUser")
const eventGenerator = require("../../../tests/utils/eventGenerator")
const validators = require("../../../tests/utils/validators")
const userUtil = require("../../utils/database/users")
const { existingUser } = require("../../../tests/staticData")

jest.mock("../../utils/database/users")
jest.mock("../../config/dbConn")

const context = {
  callbackWaitsForEmptyEventLoop: true,
}

describe("POST /user", () => {
  describe("Return 400 if missing required fields", () => {
    test("Should return 400 if all required fields are undefined", async () => {
      const event = eventGenerator({
        body: {},
      })

      const res = await createAUser.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if username is evaluates to false", async () => {
      const event = eventGenerator({
        body: {
          username: "",
          name: "name",
          password: "password",
          email: "email",
        },
      })

      const res = await createAUser.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if name is evaluates to false", async () => {
      const event = eventGenerator({
        body: {
          username: "username",
          name: "",
          password: "password",
          email: "email",
        },
      })

      const res = await createAUser.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if password is evaluates to false", async () => {
      const event = eventGenerator({
        body: {
          username: "username",
          name: "name",
          password: "",
          email: "email",
        },
      })

      const res = await createAUser.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })

    test("Should return 400 if email is evaluates to false", async () => {
      const event = eventGenerator({
        body: {
          username: "username",
          name: "name",
          password: "password",
          email: "",
        },
      })

      const res = await createAUser.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("All fields are required")
    })
  })

  describe("Return 400 if unique fields are duplicate", () => {
    test("Should return 400 if username is duplicate", async () => {
      userUtil.DBCheckUsernameOrEmailIsTaken.mockImplementation(
        () => "username"
      )

      const event = eventGenerator({
        body: {
          username: "username",
          name: "name",
          password: "password",
          email: "email",
        },
      })

      const res = await createAUser.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Duplicate username")
    })

    test("Should return 400 if email is duplicate", async () => {
      userUtil.DBCheckUsernameOrEmailIsTaken.mockImplementation(() => "email")

      const event = eventGenerator({
        body: {
          username: "username",
          name: "name",
          password: "password",
          email: "email",
        },
      })

      const res = await createAUser.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Duplicate email")
    })
  })

  describe("Return 201 user is added to db", () => {
    test("should return 201 and user object", async () => {
      userUtil.DBCreateUser.mockImplementation(() => existingUser)

      const event = eventGenerator({
        body: {
          name: "name",
          username: "username",
          password: "password",
          email: "email",
        },
      })

      const res = await createAUser.handler(event, context)

      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(201)
      expect(JSON.parse(res.body).user).toEqual(existingUser)
    })
  })
})

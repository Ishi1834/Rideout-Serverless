const authenticate = require("./authenticate")
const eventGenerator = require("../../tests/utils/eventGenerator")
const validators = require("../../tests/utils/validators")
const jwt = require("jsonwebtoken")
const {
  context: contextBase,
  existingUser,
  nonExistingUserId,
} = require("../../tests/staticData")

jest.mock("jsonwebtoken")

const context = {
  ...contextBase,
  end: jest.fn(),
}

function TestError(name, message) {
  this.message = message || ""
  this.name = name
}

afterEach(() => {
  jest.resetAllMocks()
})

describe("authenticate middleware", () => {
  describe("Return 400 if valid auth token isn't given", () => {
    test("Should return 400 and 'unauthorized' if token isn't given", async () => {
      const event = eventGenerator({
        headers: {},
      })

      const res = await authenticate.handler(event, context)
      // mock
      expect(context.end).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("unauthorized")
    })

    test("Should return 400 and 'unauthorized' if token isn't given in correct format", async () => {
      const event = eventGenerator({
        headers: {
          authorization: "tokenHere",
        },
      })

      const res = await authenticate.handler(event, context)
      // mock
      expect(context.end).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("unauthorized")
    })

    test("Should return 400 and 'unauthorized' if token given isn't valid", async () => {
      jwt.verify.mockImplementation(() => {
        throw new TestError("JsonWebTokenError")
      })
      const event = eventGenerator({
        headers: {
          authorization: "Bearer invalidToken",
        },
      })

      const res = await authenticate.handler(event, context)
      // mock
      expect(jwt.verify).toHaveBeenCalledWith(
        "invalidToken",
        "accessTokenSecret"
      )
      expect(context.end).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(401)
      expect(JSON.parse(res.body).message).toBe("Invalid authToken")
    })
  })

  describe("Return userId and userClubs if valid authToken is given", () => {
    test("Should return userId and userClubs object if valid authToken is given", async () => {
      jwt.verify.mockImplementation(() => {
        return {
          userId: existingUser._id,
          clubs: existingUser.clubs,
        }
      })
      const event = eventGenerator({
        headers: {
          authorization: "Bearer validAuthToken",
        },
      })

      const userObject = await authenticate.handler(event, context)
      // mock
      expect(jwt.verify).toHaveBeenCalledWith(
        "validAuthToken",
        "accessTokenSecret"
      )
      expect(context.end).toHaveBeenCalledTimes(0)
      // response
      expect(userObject).toEqual({
        userId: existingUser._id,
        userClubs: existingUser.clubs,
      })
    })
  })

  describe("Return 500 if there is an error", () => {
    test("Should return 500 and error message if there is an error", async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("Error decoding token")
      })
      const event = eventGenerator({
        headers: {
          authorization: "Bearer validAuthToken",
        },
      })

      const res = await authenticate.handler(event, context)
      // mock
      expect(jwt.verify).toHaveBeenCalledWith(
        "validAuthToken",
        "accessTokenSecret"
      )
      expect(context.end).toHaveBeenCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error decoding token")
    })
  })
})

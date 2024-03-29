const authenticate = require("./authenticate")
const eventGenerator = require("../../tests/utils/eventGenerator")
const validators = require("../../tests/utils/validators")
const jwt = require("jsonwebtoken")
const { context: contextBase, existingUser } = require("../../tests/staticData")

jest.mock("jsonwebtoken")

const context = {
  ...contextBase,
  end: jest.fn(),
}

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
})

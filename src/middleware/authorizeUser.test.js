const authorizeUser = require("./authorizeUser")
const eventGenerator = require("../tests/utils/eventGenerator")
const validators = require("../tests/utils/validators")
const { context: contextBase, existingUser } = require("../tests/staticData")

describe("authorizeUser middleware", () => {
  test("Return 403 if userId from token doesn't match path parameter userId", async () => {
    const context = {
      ...contextBase,
      end: jest.fn(),
      prev: {
        userId: existingUser._id,
      },
    }
    const event = eventGenerator({
      pathParametersObject: {
        userId: "differentUserId",
      },
    })

    const res = await authorizeUser.handler(event, context)
    // mock
    expect(context.end).toHaveBeenCalledTimes(1)
    // response
    expect(validators.isApiGatewayResponse(res)).toBe(true)
    expect(res.statusCode).toBe(403)
    expect(JSON.parse(res.body).message).toBe("Forbidden")
  })

  test("Return object with userId if userId from token matches path parameter userId", async () => {
    const context = {
      ...contextBase,
      end: jest.fn(),
      prev: {
        userId: existingUser._id,
      },
    }
    const event = eventGenerator({
      pathParametersObject: {
        userId: existingUser._id,
      },
    })

    const res = await authorizeUser.handler(event, context)
    // mock
    expect(context.end).toHaveBeenCalledTimes(0)
    // response
    expect(res).toEqual({
      userId: existingUser._id,
    })
  })
})

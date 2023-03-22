const handleError = require("./handleError")
const eventGenerator = require("../../tests/utils/eventGenerator")
const validators = require("../../tests/utils/validators")
const { context: contextBase } = require("../../tests/staticData")

describe("handleError middleware", () => {
  test("Return 403 if 'JsonWebTokenError' is recieved", async () => {
    const context = {
      ...contextBase,
      end: jest.fn(),
      prev: {
        name: "JsonWebTokenError",
        message: "Invalid token",
      },
    }
    const event = eventGenerator({})

    const res = await handleError.handler(event, context)

    // mock
    expect(context.end).toHaveBeenCalledTimes(1)
    // response
    expect(validators.isApiGatewayResponse(res)).toBe(true)
    expect(res.statusCode).toBe(403)
    expect(JSON.parse(res.body).message).toBe("Invalid token")
  })

  test("Return 500 if and error message", async () => {
    const context = {
      ...contextBase,
      end: jest.fn(),
      prev: {
        name: "DB connection failed",
        message: "Db connection failed",
      },
    }
    const event = eventGenerator({})

    const res = await handleError.handler(event, context)

    // mock
    expect(context.end).toHaveBeenCalledTimes(1)
    // response
    expect(validators.isApiGatewayResponse(res)).toBe(true)
    expect(res.statusCode).toBe(500)
    expect(JSON.parse(res.body).error).toBe("Db connection failed")
  })
})

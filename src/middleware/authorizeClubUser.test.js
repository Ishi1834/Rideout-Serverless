const authorizeClubUser = require("./authorizeClubUser")
const eventGenerator = require("../tests/utils/eventGenerator")
const validators = require("../tests/utils/validators")
const { context: contextBase, existingClub } = require("../tests/staticData")

describe("authorizeClubUser middleware", () => {
  test("Should return 403 if user isn't a club member", async () => {
    const context = {
      ...contextBase,
      end: jest.fn(),
      prev: {
        userClubs: [],
      },
    }
    const event = eventGenerator({
      pathParametersObject: {
        clubId: existingClub._id,
      },
    })

    const res = await authorizeClubUser.handler(event, context)
    // mock
    expect(context.end).toHaveBeenCalledTimes(1)
    // response
    expect(validators.isApiGatewayResponse(res)).toBe(true)
    expect(res.statusCode).toBe(403)
    expect(JSON.parse(res.body).message).toBe("Forbidden")
  })

  test("Should return userAuthorization if user is club member", async () => {
    const context = {
      ...contextBase,
      prev: {
        userClubs: [
          {
            clubId: existingClub._id,
            authorization: "user",
          },
        ],
      },
    }

    const event = eventGenerator({
      pathParametersObject: {
        clubId: existingClub._id,
      },
    })

    const res = await authorizeClubUser.handler(event, context)

    // response
    expect(res.userAuthorization).toBe("user")
  })
})

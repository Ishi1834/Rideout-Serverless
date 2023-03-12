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

  describe("Return userAuthorization if user has correct role", () => {
    test("Should return userAuthorization if user has role 'user'", async () => {
      const context = {
        ...contextBase,
        prev: {
          userClubs: [
            {
              clubId: existingClub._id,
              authorization: "user",
            },
          ],
          userId: "validUserId",
        },
      }

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
      })

      const res = await authorizeClubUser.handler(event, context)

      // response
      expect(res).toEqual({
        userAuthorization: "user",
        userId: "validUserId",
      })
    })

    test("Should return userAuthorization if user has role 'editor'", async () => {
      const context = {
        ...contextBase,
        prev: {
          userClubs: [
            {
              clubId: existingClub._id,
              authorization: "editor",
            },
          ],
          userId: "validUserId",
        },
      }

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
      })

      const res = await authorizeClubUser.handler(event, context)

      // response
      expect(res).toEqual({
        userAuthorization: "editor",
        userId: "validUserId",
      })
    })

    test("Should return userAuthorization if user has role 'admin'", async () => {
      const context = {
        ...contextBase,
        prev: {
          userClubs: [
            {
              clubId: existingClub._id,
              authorization: "admin",
            },
          ],
          userId: "validUserId",
        },
      }

      const event = eventGenerator({
        pathParametersObject: {
          clubId: existingClub._id,
        },
      })

      const res = await authorizeClubUser.handler(event, context)

      // response
      expect(res).toEqual({
        userAuthorization: "admin",
        userId: "validUserId",
      })
    })
  })
})

const updateAClub = require("./updateAClub")
const eventGenerator = require("../../tests/utils/eventGenerator")
const validators = require("../../tests/utils/validators")
const clubUtil = require("../../utils/database/clubs")
const {
  existingClub,
  existingUser,
  context: contextBase,
} = require("../../tests/staticData")

jest.mock("../../utils/database/clubs")

const context = {
  ...contextBase,
  prev: {
    userId: existingUser._id,
    userClubs: existingUser.clubs,
  },
}

afterEach(() => {
  jest.resetAllMocks()
})

describe("PATCH /clubs/{clubId}", () => {
  describe("Return 400 if request isn't valid", () => {
    test("Should return 400 if no property is given in body", async () => {
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "clubId",
        },
        body: {},
      })

      const res = await updateAClub.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe(
        "Atleast 1 property must be given, to update club"
      )
    })

    test("Should return 400 if location isn't an array of 2 number", async () => {
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "clubId",
        },
        body: {
          location: "no an array",
        },
      })

      const res = await updateAClub.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe(
        "Location should be an array of 2 numbers"
      )
    })

    test("Should return 400 if tags isn't an array", async () => {
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "clubId",
        },
        body: {
          tags: "not an array",
        },
      })

      const res = await updateAClub.handler(event, context)

      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Tags should be an array")
    })

    test("Should return 400 if clubId has no associated club", async () => {
      clubUtil.DBFindClubById.mockImplementation(() => null)
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "invalidClubId",
        },
        body: {
          location: [50, 50],
          tags: ["cycling"],
        },
      })

      const res = await updateAClub.handler(event, context)

      // mocks
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("invalidClubId")
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body).message).toBe("Invalid club")
    })
  })

  describe("Return 200 if valid request is made", () => {
    test("Should update location and return 200 and updated club", async () => {
      const testClub = { ...existingClub, save: jest.fn() }
      clubUtil.DBFindClubById.mockImplementation(() => testClub)
      testClub.save.mockImplementation(() => testClub)
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "validClubId",
        },
        body: {
          location: [50, 70],
        },
      })

      const res = await updateAClub.handler(event, context)

      // mocks
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("validClubId")
      expect(testClub.save).toBeCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual({
        message: "Club updated",
        club: {
          ...existingClub,
          location: {
            type: "Point",
            coordinates: [50, 70],
          },
        },
      })
    })

    test("Should update tags and return 200 and updated club", async () => {
      const testClub = { ...existingClub, save: jest.fn() }
      clubUtil.DBFindClubById.mockImplementation(() => testClub)
      testClub.save.mockImplementation(() => testClub)
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "validClubId",
        },
        body: {
          tags: ["cycling"],
        },
      })

      const res = await updateAClub.handler(event, context)

      // mocks
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("validClubId")
      expect(testClub.save).toBeCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual({
        message: "Club updated",
        club: {
          ...existingClub,
          tags: ["cycling"],
        },
      })
    })

    test("Should update city and return 200 and updated club", async () => {
      const testClub = { ...existingClub, save: jest.fn() }
      clubUtil.DBFindClubById.mockImplementation(() => testClub)
      testClub.save.mockImplementation(() => testClub)
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "validClubId",
        },
        body: {
          city: "London",
        },
      })

      const res = await updateAClub.handler(event, context)

      // mocks
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("validClubId")
      expect(testClub.save).toBeCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual({
        message: "Club updated",
        club: {
          ...existingClub,
          city: "London",
        },
      })
    })

    test("Should update description and return 200 and updated club", async () => {
      const testClub = { ...existingClub, save: jest.fn() }
      clubUtil.DBFindClubById.mockImplementation(() => testClub)
      testClub.save.mockImplementation(() => testClub)
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "validClubId",
        },
        body: {
          description: "Cycling club",
        },
      })

      const res = await updateAClub.handler(event, context)

      // mocks
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("validClubId")
      expect(testClub.save).toBeCalledTimes(1)
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual({
        message: "Club updated",
        club: {
          ...existingClub,
          description: "Cycling club",
        },
      })
    })
  })

  describe("Return 500 if there is an error", () => {
    test("Should return 500 and error message", async () => {
      clubUtil.DBFindClubById.mockImplementation(() => {
        throw new Error("Error finding club")
      })
      const event = eventGenerator({
        pathParametersObject: {
          clubId: "validClubId",
        },
        body: {
          location: [50, 50],
          tags: ["cycling"],
        },
      })

      const res = await updateAClub.handler(event, context)

      // mocks
      expect(clubUtil.DBFindClubById).toHaveBeenCalledWith("validClubId")
      // response
      expect(validators.isApiGatewayResponse(res)).toBe(true)
      expect(res.statusCode).toBe(500)
      expect(JSON.parse(res.body).error).toBe("Error finding club")
    })
  })
})

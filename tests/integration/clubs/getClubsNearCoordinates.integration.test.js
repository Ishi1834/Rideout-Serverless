const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")

describe("GET /clubs/{clubId} integration test", () => {
  test("User can get a clubs near given coordinates", async () => {
    const userObject = {
      username: "username",
      email: "user@email.com",
      password: "password",
      name: "user",
    }
    const clubObject = {
      name: "clubName",
      location: {
        type: "Point",
        coordinates: [50, 50],
      },
      city: "London",
      members: [],
    }
    await Promise.all([
      await dbHelper.addClubToDB({
        ...clubObject,
        name: "testC",
        location: {
          type: "Point",
          coordinates: [49.998, 50],
        },
      }),
      await dbHelper.addClubToDB({
        ...clubObject,
        name: "test3",
        location: {
          type: "Point",
          coordinates: [50.003, 50.023],
        },
      }),
      await dbHelper.addClubToDB({ ...clubObject, name: "test5" }),
    ])
    const { authToken } = await dbHelper.getValidUserTokens(userObject)

    const res = await axios.get(
      "http://localhost:3000/clubs?lng=50.11&lat=49.98",
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        validateStatus: () => true,
      }
    )

    expect(res.status).toBe(200)
    expect(res.data).toMatchObject([
      {
        activitiesCount: 0,
        city: "London",
        cyclistCount: 1,
        description: "",
        distanceToClub: 8181.372577812542,
        location: { coordinates: [50, 50], type: "Point" },
        members: [],
        name: "test5",
        rides: [],
        tags: [],
        userRequestingToJoinClub: [],
      },
      {
        activitiesCount: 0,
        city: "London",
        cyclistCount: 1,
        description: "",
        distanceToClub: 8319.200362228185,
        location: { coordinates: [49.998, 50], type: "Point" },
        members: [],
        name: "testC",
        rides: [],
        tags: [],
        userRequestingToJoinClub: [],
      },
      {
        activitiesCount: 0,
        city: "London",
        cyclistCount: 1,
        description: "",
        distanceToClub: 9029.292310784414,
        location: { coordinates: [50.003, 50.023], type: "Point" },
        members: [],
        name: "test3",
        rides: [],
        tags: [],
        userRequestingToJoinClub: [],
      },
    ])
  })
})

const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")

describe("GET /clubs/{clubId} integration test", () => {
  test("User can get a club if they are a member", async () => {
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
    }
    const { authToken, clubId } = await dbHelper.getValidUserTokenWithClub(
      userObject,
      clubObject
    )

    const res = await axios.get(`http://localhost:3000/clubs/${clubId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      validateStatus: () => true,
    })

    expect(res.status).toBe(200)
    expect(res.data).toMatchObject({
      name: "clubName",
      location: {
        type: "Point",
        coordinates: [50, 50],
      },
      city: "London",
      description: "",
      tags: [],
      cyclistCount: 1,
      activitiesCount: 0,
      rides: [],
      userRequestingToJoinClub: [],
    })
  })
})

const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")

describe("POST /clubs integration test", () => {
  test("User can create a club", async () => {
    const { authToken, userId } = await dbHelper.getValidUserTokens({
      username: "username",
      email: "user@email.com",
      password: "password",
      name: "user",
    })

    const body = {
      name: "clubName",
      location: [50, 50],
      city: "London",
    }

    const res = await axios.post("http://localhost:3000/clubs", body, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      validateStatus: () => true,
    })

    expect(res.status).toBe(201)
    expect(res.data).toMatchObject({
      message: "Club created",
      club: {
        name: "clubName",
        location: {
          type: "Point",
          coordinates: [50, 50],
        },
        city: "London",
        cyclistCount: 1,
        activitiesCount: 0,
        rides: [],
        members: [
          {
            username: "username",
            userId: userId.toString(),
            authorization: "admin",
          },
        ],
      },
    })
  })
})

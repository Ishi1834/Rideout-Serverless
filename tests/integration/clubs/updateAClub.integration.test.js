const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")

describe("PATCH /clubs/{clubId} integration test", () => {
  test("User can update a club if they have role 'admin'", async () => {
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

    const body = {
      location: [20, 30],
      city: "Manchester",
      tags: ["Road Cycling"],
    }

    const res = await axios.patch(
      `http://localhost:3000/clubs/${clubId}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        validateStatus: () => true,
      }
    )

    expect(res.status).toBe(200)
    expect(res.data.message).toBe("Club updated")
  })
})

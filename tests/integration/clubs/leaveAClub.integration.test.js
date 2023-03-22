const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")

describe("PATCH /clubs/{clubId}/leave integration test", () => {
  test("User can leave a club", async () => {
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
    const { authToken, clubId } = await dbHelper.getValidUserTokenWithClub(
      userObject,
      clubObject
    )

    const res = await axios.patch(
      `http://localhost:3000/clubs/${clubId}/leave`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        validateStatus: () => true,
      }
    )

    expect(res.status).toBe(200)
    expect(res.data.message).toBe("You have left this club")
  })
})

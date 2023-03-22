const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")

describe("PATCH /clubs/{clubId}/join integration test", () => {
  test("User can request to join a club", async () => {
    const clubObject = {
      name: "clubName",
      location: {
        type: "Point",
        coordinates: [50, 50],
      },
      city: "London",
      members: [],
    }
    const { _id: clubId } = await dbHelper.addClubToDB(clubObject)
    const userObject = {
      username: "username",
      email: "user@email.com",
      password: "password",
      name: "user",
    }
    const { authToken } = await dbHelper.getValidUserTokens(userObject)

    const res = await axios.patch(
      `http://localhost:3000/clubs/${clubId}/join`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        validateStatus: () => true,
      }
    )

    expect(res.status).toBe(200)
    expect(res.data.message).toBe("Join request sent")
  })
})

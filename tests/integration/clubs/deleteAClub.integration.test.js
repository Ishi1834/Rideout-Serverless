const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")

describe("DELETE /clubs/{clubId} integration test", () => {
  test("User can delete a club if they have role 'admin'", async () => {
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

    const res = await axios.delete(`http://localhost:3000/clubs/${clubId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      validateStatus: () => true,
    })

    const club = await dbHelper.getClub(clubId)
    expect(res.status).toBe(200)
    expect(res.data.message).toBe("Club deleted")
    expect(club).toBe(null)
  })
})

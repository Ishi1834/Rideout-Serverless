const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")
const mongoose = require("mongoose")

describe("DELETE /clubs/{clubId} integration test", () => {
  test("User can delete a club if they have role 'admin'", async () => {
    const userId = mongoose.Types.ObjectId()
    const clubId = mongoose.Types.ObjectId()
    const userObject = {
      _id: userId,
      username: "username",
      email: "user@email.com",
      password: "password",
      name: "user",
      clubs: [
        {
          authorization: "admin",
          clubId: clubId,
        },
      ],
    }
    const clubObject = {
      _id: clubId,
      name: "clubName",
      location: {
        type: "Point",
        coordinates: [50, 50],
      },
      city: "London",
      members: [
        {
          username: "username",
          userId: userId,
          authorization: "admin",
        },
      ],
    }
    await dbHelper.addClubToDB(clubObject)
    const { authToken } = await dbHelper.getValidUserTokens(userObject)

    const res = await axios.delete(`http://localhost:3000/clubs/${clubId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      validateStatus: () => true,
    })

    expect(res.status).toBe(200)
    expect(res.data.message).toBe("Club deleted")
  })
})

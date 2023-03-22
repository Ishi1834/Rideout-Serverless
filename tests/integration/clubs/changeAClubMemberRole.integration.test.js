const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")
const mongoose = require("mongoose")

describe("PATCH /clubs/{clubId}/members integration test", () => {
  test("'admin' can change a club member role", async () => {
    const memberId = mongoose.Types.ObjectId()
    const clubId = mongoose.Types.ObjectId()
    const clubMember = {
      _id: memberId,
      username: "user1",
      email: "user1@email.com",
      password: "password1",
      name: "user1",
      clubs: [
        {
          name: "clubName",
          clubId: clubId,
        },
      ],
    }
    await dbHelper.addUserToDB(clubMember)
    const adminObject = {
      username: "admin123",
      email: "admin@email.com",
      password: "password",
      name: "admin",
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
          username: "user1",
          userId: memberId,
          authorization: "user",
        },
      ],
    }
    const { authToken } = await dbHelper.getValidUserTokenWithClub(
      adminObject,
      clubObject
    )

    const res = await axios.patch(
      `http://localhost:3000/clubs/${clubId}/members`,
      {
        userId: memberId,
        changeTo: "editor",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        validateStatus: () => true,
      }
    )

    expect(res.status).toBe(200)
    expect(res.data.message).toBe("User role updated")
  })
})

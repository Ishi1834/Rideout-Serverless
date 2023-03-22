const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")
const mongoose = require("mongoose")

describe("DELETE /clubs/{clubId}/rides integration test", () => {
  test("User can delete a club ride if they are 'admin'", async () => {
    const userId = mongoose.Types.ObjectId()
    const clubId = mongoose.Types.ObjectId()
    const rideId = mongoose.Types.ObjectId()
    const date = new Date().toISOString()

    await dbHelper.addClubToDB({
      _id: clubId,
      name: "clubname",
      location: {
        type: "Point",
        coordinates: [50, 50],
      },
      city: "London",
      rides: [rideId],
      members: [
        {
          username: "username",
          userId: userId,
          authorization: "admin",
        },
      ],
    })
    await dbHelper.addRideToDB({
      _id: rideId,
      name: "ridename",
      createdBy: {
        username: "username",
        userId: userId,
      },
      date: date,
      clubId: clubId,
      startLocation: {
        type: "Point",
        coordinates: [40, 60],
      },
      description: "description",
      rideType: "Social",
      distance: 40,
      speed: 25,
    })
    const { authToken } = await dbHelper.getValidUserTokens({
      _id: userId,
      username: "username",
      email: "user@email.com",
      password: "password",
      name: "user",
      rides: [rideId],
      clubs: [
        {
          authorization: "admin",
          clubId: clubId,
        },
      ],
    })

    const res = await axios.delete(
      `http://localhost:3000/clubs/${clubId}/rides/${rideId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        validateStatus: () => true,
      }
    )

    expect(res.status).toBe(200)
    expect(res.data.message).toBe("Ride deleted")
  })
})

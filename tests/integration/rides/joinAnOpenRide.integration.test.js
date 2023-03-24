const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")
const mongoose = require("mongoose")

describe("PATCH /rides/{rideId}/join integration test", () => {
  test("User can join an open ride", async () => {
    const userId = mongoose.Types.ObjectId()
    const rideCreatorId = mongoose.Types.ObjectId()
    const rideId = mongoose.Types.ObjectId()
    const date = new Date().getTime() + 10000

    await dbHelper.addRideToDB({
      _id: rideId,
      name: "ridename",
      createdBy: {
        username: "test11",
        userId: rideCreatorId,
      },
      date: date,
      openRide: true,
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
      rides: [],
      clubs: [],
    })

    const res = await axios.patch(
      `http://localhost:3000/rides/${rideId}/join`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        validateStatus: () => true,
      }
    )

    expect(res.status).toBe(200)
    expect(res.data.message).toBe("Ride joined")
  })
})

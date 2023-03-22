const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")
const mongoose = require("mongoose")

describe("DELETE /rides/{rideId} integration test", () => {
  test("User can delete a ride if user is ride creator", async () => {
    const userId = mongoose.Types.ObjectId()
    const rideId = mongoose.Types.ObjectId()
    const date = new Date().toISOString()

    await dbHelper.addRideToDB({
      _id: rideId,
      name: "ridename",
      createdBy: {
        username: "username",
        userId: userId,
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
      rides: [rideId],
      clubs: [],
    })

    const res = await axios.delete(`http://localhost:3000/rides/${rideId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      validateStatus: () => true,
    })

    expect(res.status).toBe(200)
    expect(res.data.message).toBe("Ride deleted")
  })
})

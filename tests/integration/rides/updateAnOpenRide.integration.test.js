const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")
const mongoose = require("mongoose")

describe("PATCH /rides/{rideId} integration test", () => {
  test("User can update an open ride if they are ride creator", async () => {
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

    const newDate = new Date().toISOString()
    const body = {
      rideType: "Training",
      distance: 33,
      speed: 17,
      date: newDate,
      description: "description here",
      cafeStops: "midway cake stop",
      route: "route",
      startLocation: [20, 50],
    }

    const res = await axios.patch(
      `http://localhost:3000/rides/${rideId}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        validateStatus: () => true,
      }
    )

    expect(res.status).toBe(200)
    expect(res.data.message).toBe("Ride updated")
    expect(res.data.ride).toMatchObject({
      _id: rideId.toString(),
      name: "ridename",
      createdBy: {
        username: "username",
        userId: userId.toString(),
      },
      date: newDate,
      startLocation: { type: "Point", coordinates: [20, 50] },
      description: "description here",
      openRide: true,
      rideType: "Training",
      distance: 33,
      speed: 17,
      signedUpCyclists: [],
      cafeStops: "midway cake stop",
      route: "route",
    })
  })
})

const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")
const mongoose = require("mongoose")

describe("GET /rides integration test", () => {
  test("User can get openRides rides near there location", async () => {
    const userId = mongoose.Types.ObjectId()
    const differentUserId = mongoose.Types.ObjectId()
    const rideId = mongoose.Types.ObjectId()
    const date = new Date().getTime() + 10000

    await dbHelper.addRideToDB({
      _id: rideId,
      name: "ridename",
      createdBy: {
        username: "username11",
        userId: differentUserId,
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

    const res = await axios.get(
      `http://localhost:3000/rides?lat=${59.99}&lng=${39.99}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        validateStatus: () => true,
      }
    )

    expect(res.status).toBe(200)
    expect(res.data).toMatchObject([
      {
        createdBy: {
          username: "username11",
          userId: differentUserId.toString(),
        },
        startLocation: { type: "Point", coordinates: [40, 60] },
        _id: rideId.toString(),
        name: "ridename",
        date: new Date(date).toISOString(),
        openRide: true,
        rideType: "Social",
        distance: 40,
        speed: 25,
        description: "description",
        signedUpCyclists: [],
        distanceToStart: 1244.6201448695533,
      },
    ])
  })
})

const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")

describe("POST /rides integration test", () => {
  test("User can create an open ride", async () => {
    const userObject = {
      username: "username",
      email: "user@email.com",
      password: "password",
      name: "user",
    }
    const { authToken, userId } = await dbHelper.getValidUserTokens(userObject)
    const date = new Date()

    const body = {
      name: "name",
      date,
      startLocation: [40, 60],
      description: "description",
      rideType: "Social",
      distance: 40,
      speed: 25,
    }

    const res = await axios.post("http://localhost:3000/rides", body, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      validateStatus: () => true,
    })

    expect(res.status).toBe(201)
    expect(res.data.message).toBe("Ride created")
    expect(res.data.ride.clubId).not.toBeDefined()
    expect(res.data.ride).toMatchObject({
      name: "name",
      createdBy: {
        username: "username",
        userId: userId.toString(),
      },
      date: date.toISOString(),
      startLocation: {
        type: "Point",
        coordinates: [40, 60],
      },
      openRide: true,
      rideType: "Social",
      distance: 40,
      speed: 25,
      signedUpCyclists: [
        {
          username: "username",
          userId: userId.toString(),
        },
      ],
      description: "description",
    })
  })
})

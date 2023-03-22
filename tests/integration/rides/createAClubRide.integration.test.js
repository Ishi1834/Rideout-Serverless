const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")

describe("POST /clubs/{clubId}/rides integration test", () => {
  test("User can create a club if they are 'admin'", async () => {
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
      members: [],
    }
    const { authToken, clubId, userId } =
      await dbHelper.getValidUserTokenWithClub(userObject, clubObject)
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

    const res = await axios.post(
      `http://localhost:3000/clubs/${clubId}/rides`,
      body,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        validateStatus: () => true,
      }
    )

    expect(res.status).toBe(201)
    expect(res.data.message).toBe("Ride created")
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

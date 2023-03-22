const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")

describe("POST /clubs/{clubId}/members integration test", () => {
  test("'admin' can add a user to club", async () => {
    const userToBeAddedToClubObject = {
      username: "user1",
      email: "user1@email.com",
      password: "password1",
      name: "user1",
    }
    const userToBeAddedToClub = await dbHelper.addUserToDB(
      userToBeAddedToClubObject
    )

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
      userRequestingToJoinClub: [
        {
          username: userToBeAddedToClub.username,
          userId: userToBeAddedToClub._id,
        },
      ],
    }
    const { authToken, clubId } = await dbHelper.getValidUserTokenWithClub(
      userObject,
      clubObject
    )

    const res = await axios.post(
      `http://localhost:3000/clubs/${clubId}/members`,
      {
        userId: userToBeAddedToClub._id,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        validateStatus: () => true,
      }
    )

    expect(res.status).toBe(200)
    expect(res.data.message).toBe("User added to club")
  })
})

const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")

describe("GET /user/{userId} integration test", () => {
  test("User is able to get profile", async () => {
    const { authToken, userId } = await dbHelper.getValidUserTokens({
      username: "username",
      email: "user@email.com",
      password: "password",
      name: "user",
    })

    const res = await axios.get(`http://localhost:3000/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      validateStatus: () => true,
    })

    expect(res.status).toBe(200)
    expect(res.data).toMatchObject({
      _id: userId.toString(),
      username: "username",
      name: "user",
      email: "user@email.com",
      rides: [],
      reportedContent: [],
      emailVerified: false,
      clubRequests: [],
      clubs: [],
    })
  })
})

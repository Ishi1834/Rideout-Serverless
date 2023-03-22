const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")

describe("DELETE /user/{userId} integration test", () => {
  test("User is able to get profile", async () => {
    const { authToken, userId } = await dbHelper.getValidUserTokens({
      username: "username",
      email: "user@email.com",
      password: "password",
      name: "user",
    })

    const res = await axios.delete(`http://localhost:3000/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      validateStatus: () => true,
    })

    const user = await dbHelper.getUser(userId)
    expect(res.status).toBe(200)
    expect(user).toBe(null)
  })
})

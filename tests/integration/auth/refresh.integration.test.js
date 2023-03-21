const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")

describe("POST /auth/refresh integration test", () => {
  test("New tokens are returned, when given refreshToken", async () => {
    const { refreshToken } = await dbHelper.getValidUserTokens({
      username: "username",
      email: "user@email.com",
      password: "password",
      name: "user",
    })

    const res = await axios.post(
      "http://localhost:3000/auth/refresh",
      { refreshToken },
      {
        validateStatus: () => true,
      }
    )

    expect(res.status).toBe(200)
    expect(res.data.userId).toBeDefined()
    expect(res.data.authToken).toBeDefined()
    expect(res.data.refreshToken).toBeDefined()
  })
})

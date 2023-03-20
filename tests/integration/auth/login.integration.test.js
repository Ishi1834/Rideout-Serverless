const axios = require("axios")
const dbHelper = require("../../utils/dbHelper")

describe("POST /auth/login integration test", () => {
  test("A user can login with correct credentials", async () => {
    await dbHelper.addUserToDB({
      username: "username",
      email: "user@email.com",
      password: "password",
      name: "user",
    })

    const body = {
      username: "username",
      password: "password",
    }

    const res = await axios.post("http://localhost:3000/auth/login", body, {
      validateStatus: () => true,
    })

    expect(res.status).toBe(200)
    expect(res.data.authenticated).toBe(true)
    expect(res.data.userId).toBeDefined()
    expect(res.data.authToken).toBeDefined()
    expect(res.data.refreshToken).toBeDefined()
  })
})

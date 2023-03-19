const axios = require("axios")

describe("POST /users integration test", () => {
  test("User is able to sign up", async () => {
    const body = {
      name: "name",
      username: "username",
      email: "user@email.com",
      password: "password",
    }
    const res = await axios.post("http://localhost:3000/users", body, {
      validateStatus: () => true,
    })
    console.log("message", res.data)
    expect(res.status).toEqual(200)
    expect(res.data).toMatchObject({
      name: "name",
      username: "username",
      email: "user@email.com",
    })
  })
})

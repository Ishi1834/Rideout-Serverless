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

    expect(res.status).toEqual(201)
    expect(res.data.user).toMatchObject({
      name: "name",
      username: "username",
      email: "user@email.com",
      clubRequests: [],
      clubs: [],
      rides: [],
      emailVerified: false,
      reportedContent: [],
    })
  })
})

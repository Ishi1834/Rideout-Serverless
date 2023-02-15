const createUser = require("./createUser")
const eventGenerator = require("../../tests/utils/eventGenerator")

const context = {
  callbackWaitsForEmptyEventLoop: true,
}

describe("POST /user", () => {
  test("Should return 400 if required fields are null", async () => {
    const event = eventGenerator({
      body: {},
    })
    const res = await createUser.handler(event, context)
    expect(res.statusCode).toBe(400)
    expect(JSON.parse(res.body).message).toBe("All fields are required")
  })
})

// https://github.com/AppGambitStudio/serverless-testing
// https://github.com/chief-wizard/serverless-jest-example
// https://mongoosejs.com/docs/lambda.html

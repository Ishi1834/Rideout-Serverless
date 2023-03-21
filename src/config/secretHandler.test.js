const secretsUtil = require("./secretHandler")

describe("Secret handler util works correctly", () => {
  test("Should return correct secret if NODE_ENV is test", () => {
    expect(secretsUtil.accessTokenSecret).toBe("accessTokenSecret")
    expect(secretsUtil.refreshTokenSecret).toBe("refreshTokenSecret")
    expect(secretsUtil.verificationTokenSecret).toBe("verificationTokenSecret")
    expect(secretsUtil.dbURI).toBe("mongodb://127.0.0.1:27017")
  })
})

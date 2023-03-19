const isTestEnvironment = process.env.NODE_ENV === "test" && true

const accessTokenSecret = isTestEnvironment
  ? "accessTokenSecret"
  : process.env.ACCESS_TOKEN_SECRET

const refreshTokenSecret = isTestEnvironment
  ? "refreshTokenSecret"
  : process.env.REFRESH_TOKEN_SECRET

const verificationTokenSecret = isTestEnvironment
  ? "verificationTokenSecret"
  : process.env.VERIFICATION_TOKEN_SECRET

// If integration test is running IS_OFFLINE will be true
const dbURI = process.env.IS_OFFLINE
  ? process.env.LOCAL_TEST_DATABASE_URI
  : process.env.DATABASE_URI

module.exports = {
  accessTokenSecret,
  refreshTokenSecret,
  verificationTokenSecret,
  dbURI,
}

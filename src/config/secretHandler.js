const isTestEnvironment =
  (process.env.NODE_ENV === "test" || process.env.IS_OFFLINE) && true

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
const dbURI = isTestEnvironment
  ? "mongodb://127.0.0.1:27017"
  : process.env.DATABASE_URI

module.exports = {
  accessTokenSecret,
  refreshTokenSecret,
  verificationTokenSecret,
  dbURI,
}

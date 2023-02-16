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

module.exports = {
  accessTokenSecret,
  refreshTokenSecret,
  verificationTokenSecret,
}

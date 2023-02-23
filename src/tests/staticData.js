const context = {
  callbackWaitsForEmptyEventLoop: true,
}

const nonExistingUserId = "63f7579d49b48bbf3186b025"

const existingUser = {
  _id: "63f75719297c78bb0cadbe62",
  name: "name",
  username: "username",
  password: "password",
  email: "email",
  clubs: [],
  rides: [],
}

const existingUserJWTAuthProps = [
  {
    userId: existingUser._id,
    username: existingUser.username,
    clubs: existingUser.clubs,
  },
  "accessTokenSecret",
  { expiresIn: "15m" },
]

const existingUserJWTRefreshProps = [
  {
    userId: existingUser._id,
  },
  "refreshTokenSecret",
  { expiresIn: "24h" },
]

module.exports = {
  context,
  existingUser,
  existingUserJWTAuthProps,
  existingUserJWTRefreshProps,
  nonExistingUserId,
}

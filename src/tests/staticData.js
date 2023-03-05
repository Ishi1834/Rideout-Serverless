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

const existingClub = {
  _id: "23f75719297c7sd30cadbe98",
  name: "name",
  location: {
    type: "Point",
    coordinates: [50, 50],
  },
  city: "city",
  members: [
    {
      username: existingUser.username,
      userId: existingUser._id,
      authorization: "admin",
    },
  ],
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
  existingClub,
  existingUserJWTAuthProps,
  existingUserJWTRefreshProps,
  nonExistingUserId,
}

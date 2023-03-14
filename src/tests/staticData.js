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
  cyclistCount: 1,
  rides: [],
  members: [
    {
      username: existingUser.username,
      userId: existingUser._id,
      authorization: "admin",
    },
  ],
}

const existingRide = {
  _id: "23f75fcv97c73d30baddbe18",
  name: "name",
  createdBy: {
    username: existingUser.username,
    userId: existingUser._id,
  },
  date: "date",
  openRide: false,
  clubId: existingClub._id,
  startLocation: {
    type: "Point",
    coordinates: [40, 60],
  },
  rideType: "social",
  distance: 40,
  speed: 25,
  signedUpCylists: [
    {
      username: existingUser.username,
      userId: existingUser._id,
    },
  ],
  description: "description",
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
  existingRide,
  existingUserJWTAuthProps,
  existingUserJWTRefreshProps,
  nonExistingUserId,
}

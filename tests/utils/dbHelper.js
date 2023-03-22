const User = require("../../src/models/User")
const Club = require("../../src/models/Club")
const Ride = require("../../src/models/Ride")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const addUserToDB = async (userObject) => {
  const hashedPwd = await bcrypt.hash(userObject.password, 10)
  const user = await User.create({
    ...userObject,
    password: hashedPwd,
  })
  return user
}

const addClubToDB = async (clubObject) => {
  const club = await Club.create(clubObject)
  return club
}

const addRideToDB = async (rideObject) => {
  const ride = await Ride.create(rideObject)
  return ride
}

const generateTokens = (user) => {
  const authToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
      clubs: user.clubs,
    },
    "accessTokenSecret",
    { expiresIn: "15m" }
  )

  const refreshToken = jwt.sign(
    {
      userId: user._id,
    },
    "refreshTokenSecret",
    { expiresIn: "24h" }
  )

  return { userId: user._id, authToken, refreshToken }
}

const getValidUserTokens = async (userObject) => {
  const user = await addUserToDB(userObject)
  const tokens = generateTokens(user)
  return tokens
}

const getValidUserTokenWithClub = async (userObject, clubObject) => {
  const user = await addUserToDB(userObject)
  const club = await addClubToDB({
    ...clubObject,
    members: [
      ...clubObject.members,
      { username: user.username, userId: user._id, authorization: "admin" },
    ],
  })
  user.clubs.push({
    authorization: "admin",
    clubId: club._id,
  })
  await user.save()
  const userWithClub = await getUser(user._id)
  const tokens = generateTokens(userWithClub)
  return {
    ...tokens,
    clubId: club._id,
  }
}

const getUser = async (userId) => {
  const user = await User.findById(userId)
  return user
}

const getClub = async (clubId) => {
  const club = await Club.findById(clubId)
  return club
}

module.exports = {
  addUserToDB,
  addClubToDB,
  addRideToDB,
  getValidUserTokens,
  getValidUserTokenWithClub,
  getUser,
  getClub,
}

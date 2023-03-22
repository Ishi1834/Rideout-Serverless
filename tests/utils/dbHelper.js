const User = require("../../src/models/User")
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

const getUser = async (userId) => {
  const user = await User.findById(userId)
  return user
}

module.exports = {
  addUserToDB,
  getValidUserTokens,
  getUser,
}

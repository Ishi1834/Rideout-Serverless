const connectDatabase = require("../../config/dbConn")
const {
  accessTokenSecret,
  refreshTokenSecret,
} = require("../../config/secretHandler")
const { DBFindUserById } = require("../../utils/database/users")
const Responses = require("../../utils/apiResponses")
const jwt = require("jsonwebtoken")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  await connectDatabase()
  const { refreshToken } = JSON.parse(event.body)

  if (!refreshToken) {
    return Responses._400({
      message: "All fields are required",
    })
  }

  const { userId } = jwt.verify(refreshToken, refreshTokenSecret)

  const user = await DBFindUserById(userId)
  if (!user) {
    return Responses._401({ message: "Invalid token user" })
  }

  const authToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
      clubs: user.clubs,
    },
    accessTokenSecret,
    { expiresIn: "15m" }
  )

  const newRefreshToken = jwt.sign(
    {
      userId: user._id,
    },
    refreshTokenSecret,
    { expiresIn: "24h" }
  )

  return Responses._200({
    userId: user._id,
    authToken: authToken,
    refreshToken: newRefreshToken,
  })
}

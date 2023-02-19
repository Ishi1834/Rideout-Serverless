const connectDatabase = require("../../config/dbConn")
const {
  accessTokenSecret,
  refreshTokenSecret,
} = require("../../config/secretHandler")
const { findUserById } = require("../../utils/database/users")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")
const jwt = require("jsonwebtoken")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { refreshToken } = JSON.parse(event.body)

    if (!refreshToken) {
      return Responses._400({
        message: "All fields are required",
      })
    }

    const { userId } = jwt.verify(refreshToken, refreshTokenSecret)

    const user = await findUserById(userId)
    if (!user) {
      return Responses._401({ message: "Invalid refreshToken" })
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
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      console.log(error)
      return Responses._401({ message: "Invalid refreshToken" })
    }
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

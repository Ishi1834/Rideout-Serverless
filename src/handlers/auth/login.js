const connectDatabase = require("../../config/dbConn")
const {
  accessTokenSecret,
  refreshTokenSecret,
} = require("../../config/secretHandler")
const bcrypt = require("bcrypt")
const { DBFindUser } = require("../../utils/database/users")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")
const jwt = require("jsonwebtoken")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { username, password } = JSON.parse(event.body)

    if (!username || !password) {
      return Responses._400({
        message: "All fields are required",
      })
    }

    const user = await DBFindUser({ username })
    if (!user) {
      return Responses._401({ message: "Invalid username" })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return Responses._401({ message: "Invalid password" })
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

    const refreshToken = jwt.sign(
      {
        userId: user._id,
      },
      refreshTokenSecret,
      { expiresIn: "24h" }
    )

    return Responses._200({
      authenticated: true,
      userId: user._id,
      authToken: authToken,
      refreshToken: refreshToken,
    })
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

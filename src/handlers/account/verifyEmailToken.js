const connectDatabase = require("../../config/dbConn")
const { verificationTokenSecret } = require("../../config/secretHandler")
const { DBFindUserById } = require("../../utils/database/users")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")
const jwt = require("jsonwebtoken")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { verificationToken } = event.pathParameters

    if (!verificationToken) {
      return Responses._400({
        message: "All parameters are required",
      })
    }

    const { userId } = jwt.verify(verificationToken, verificationTokenSecret)

    const user = await DBFindUserById(userId)
    if (!user) {
      return Responses._401({ message: "Invalid userId" })
    } else if (user.emailVerified) {
      return Responses._401({ message: "Email verified" })
    }

    user.emailVerified = true
    await user.save()

    return Responses._200({ message: "Email verified" })
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return Responses._401({ message: "Invalid verificationToken" })
    }
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

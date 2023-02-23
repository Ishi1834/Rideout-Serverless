const connectDatabase = require("../../config/dbConn")
const { verificationTokenSecret } = require("../../config/secretHandler")
const { findUserById } = require("../../utils/database/users")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")
const jwt = require("jsonwebtoken")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { verificationToken } = JSON.parse(event.pathParameter)

    if (!verificationToken) {
      return Responses._400({
        message: "All parameters are required",
      })
    }

    const { userId } = jwt.verify(verificationToken, verificationTokenSecret)

    const user = await findUserById(userId)
    if (!user) {
      return Responses._400({ message: "Invalid userId" })
    } else if (user.emailVerified) {
      return Responses._400({ message: "Email verified" })
    }

    user.emailVerified = true
    await user.save()

    return Responses._200({ message: "Email verified" })
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

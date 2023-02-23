const connectDatabase = require("../../config/dbConn")
const { verificationTokenSecret } = require("../../config/secretHandler")
const { findUserById } = require("../../utils/database/users")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")
const jwt = require("jsonwebtoken")
const sendEmail = require("../../utils/sendEmail")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { host } = event.headers

  try {
    await connectDatabase()
    const { userId } = JSON.parse(event.body)

    if (!userId) {
      return Responses._400({
        message: "All fields are required",
      })
    }

    const user = await findUserById(userId)
    if (!user) {
      return Responses._400({ message: "Invalid userId" })
    }

    const verificationToken = jwt.sign(
      {
        userId: user._id,
      },
      verificationTokenSecret,
      { expiresIn: "1h" }
    )
    const verificationURL = `https://${host}/account/verification/${verificationToken}`

    await sendEmail(
      user.email,
      "Confirm your email",
      generateVerificationContent(user.name, verificationURL)
    )

    return Responses._200({ message: "Email has been sent" })
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

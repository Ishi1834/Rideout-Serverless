const connectDatabase = require("../../config/dbConn")
const bcrypt = require("bcrypt")
const { findUser } = require("../../utils/database/users")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")
const generator = require("generate-password")
const { generatePasswordResetContent } = require("../../utils/emailContent")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { username } = JSON.parse(event.body)

    if (!username) {
      return Responses._400({
        message: "All fields are required",
      })
    }

    const user = await findUser({ username })
    if (!user) {
      return Responses._401({ message: "Invalid username" })
    }

    const temporaryPassword = generator.generate({
      length: 10,
      numbers: true,
    })

    // Hash password
    const hashedPwd = await bcrypt.hash(temporaryPassword, 10)

    user.password = hashedPwd
    await user.save()

    await sendEmail(
      user.email,
      "Reset your password",
      generatePasswordResetContent(user.name, temporaryPassword)
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

const connectDatabase = require("../../config/dbConn")
const bcrypt = require("bcrypt")
const { findUserById } = require("../../utils/database/users")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { userId } = context.prev
    const { password, newPassword } = JSON.parse(event.body)

    if (!password || newPassword) {
      return Responses._400({
        message: "All fields are required",
      })
    }

    const user = await findUserById(userId)
    if (!user) {
      return Responses._400({ message: "Invalid user" })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return Responses._401({ message: "Invalid password" })
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(newPassword, 10)

    user.password = hashedPwd
    await user.save()

    return Responses._200({
      message: "Password changed",
    })
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

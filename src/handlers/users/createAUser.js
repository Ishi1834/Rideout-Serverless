const connectDatabase = require("../../config/dbConn")
const bcrypt = require("bcrypt")
const {
  DBCheckUsernameOrEmailIsTaken,
  DBCreateUser,
} = require("../../utils/database/users")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { username, name, password, email } = JSON.parse(event.body)

    if (!username || !password || !name || !email) {
      return Responses._400({
        message: "All fields are required",
      })
    }

    // Check for duplicate
    const duplicateProperty = await DBCheckUsernameOrEmailIsTaken({
      username,
      email,
    })

    if (duplicateProperty === "email" || duplicateProperty === "username") {
      return Responses._400({ message: `Duplicate ${duplicateProperty}` })
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject = {
      username: username.toLowerCase(),
      password: hashedPwd,
      name,
      email: email.toLowerCase(),
    }

    // Create and store new user
    const user = await DBCreateUser(userObject)
    return Responses._201({ user })
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

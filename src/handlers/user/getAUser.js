const connectDatabase = require("../../config/dbConn")
const { DBFindUserById } = require("../../utils/database/users")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { userId } = event.pathParameters

    const user = await DBFindUserById(userId)
    if (!user) {
      return Responses._400({ message: "Invalid user" })
    }

    return Responses._200(user)
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

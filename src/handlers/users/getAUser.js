const connectDatabase = require("../../config/dbConn")
const { DBFindUserById } = require("../../utils/database/users")
const Responses = require("../../utils/apiResponses")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  await connectDatabase()
  const { userId } = event.pathParameters

  const user = await DBFindUserById(userId)
  if (!user) {
    return Responses._400({ message: "Invalid user" })
  }

  return Responses._200(user)
}

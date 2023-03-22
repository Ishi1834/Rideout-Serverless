const connectDatabase = require("../../config/dbConn")
const { verificationTokenSecret } = require("../../config/secretHandler")
const { DBFindUserById } = require("../../utils/database/users")
const Responses = require("../../utils/apiResponses")
const jwt = require("jsonwebtoken")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  await connectDatabase()
  const { verificationToken } = event.pathParameters

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
}

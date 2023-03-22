const { accessTokenSecret } = require("../config/secretHandler")
const Responses = require("../utils/apiResponses")
const jwt = require("jsonwebtoken")

module.exports.handler = async (event, context) => {
  const authHeader = event.headers.authorization || event.headers.Authorization

  if (!authHeader?.startsWith("Bearer ")) {
    context.end()
    return Responses._400({ message: "unauthorized" })
  }

  const authToken = authHeader.split(" ")[1]

  const decoded = jwt.verify(authToken, accessTokenSecret)

  return {
    userId: decoded.userId,
    userClubs: decoded.clubs,
  }
}

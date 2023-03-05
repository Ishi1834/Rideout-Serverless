const { accessTokenSecret } = require("../config/secretHandler")
const Responses = require("../utils/apiResponses")
const logger = require("../utils/logger")
const jwt = require("jsonwebtoken")

module.exports.handler = async (event, context) => {
  try {
    const authHeader =
      event.headers.authorization || event.headers.Authorization

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
  } catch (error) {
    context.end()
    if (error.name === "JsonWebTokenError") {
      return Responses._401({ message: "Invalid authToken" })
    }
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

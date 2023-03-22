const Responses = require("../utils/apiResponses")
const logger = require("../utils/logger")

module.exports.handler = async (event, context) => {
  logger(context.prev.errors)
  const errorMessage = context.prev.messsage
  context.end()

  if (context.prev.name === "JsonWebTokenError") {
    return Responses._403({ message: "Invalid token" })
  }
  return Responses._500({ error: errorMessage })
}

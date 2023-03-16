const Responses = require("../utils/apiResponses")

module.exports.handler = async (event, context) => {
  const { userId } = context.prev
  const { userId: endpointUserId } = event.pathParameters

  if (userId !== endpointUserId) {
    context.end()
    return Responses._403({ message: "Forbidden" })
  }

  return {
    userId,
  }
}

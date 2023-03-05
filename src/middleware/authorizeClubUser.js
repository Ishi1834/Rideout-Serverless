const Responses = require("../utils/apiResponses")

module.exports.handler = async (event, context) => {
  const allowedRoles = ["user", "editor", "admin"]
  const { userClubs } = context.prev
  const { clubId } = event.pathParameters

  const userAuthorization = userClubs.find(
    (clubObj) => clubObj.clubId === clubId
  )?.authorization

  if (!userAuthorization || !allowedRoles.includes(userAuthorization)) {
    context.end()
    return Responses._403({ message: "Forbidden" })
  }

  return {
    userAuthorization,
  }
}

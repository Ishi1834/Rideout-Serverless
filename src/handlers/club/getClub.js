const connectDatabase = require("../../config/dbConn")
const { findClubById } = require("../../utils/database/clubs")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { clubId } = event.pathParameters

    if (!clubId) {
      return Responses._400({
        message: "All parameters are required",
      })
    }

    const club = await findClubById(clubId)
    if (!club) {
      return Responses._400({ message: "Invalid club" })
    }

    return Responses._200({
      club,
    })
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

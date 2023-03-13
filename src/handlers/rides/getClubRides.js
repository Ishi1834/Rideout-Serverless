const connectDatabase = require("../../config/dbConn")
const { DBFindUpcomingRidesByClubId } = require("../../utils/database/rides")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { clubId } = event.pathParameters

    const rides = await DBFindUpcomingRidesByClubId(clubId)
    if (rides.length === 0) {
      return Responses._200({ message: "There are no upcoming rides" })
    }

    return Responses._200(rides)
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

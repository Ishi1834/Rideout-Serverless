const connectDatabase = require("../../config/dbConn")
const { DBFindUpcomingRidesByClubId } = require("../../utils/database/rides")
const Responses = require("../../utils/apiResponses")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  await connectDatabase()
  const { clubId } = event.pathParameters

  const rides = await DBFindUpcomingRidesByClubId(clubId)
  if (rides.length === 0) {
    return Responses._200({ message: "There are no upcoming rides" })
  }

  return Responses._200(rides)
}

const connectDatabase = require("../../config/dbConn")
const { DBFindRideById } = require("../../utils/database/rides")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { clubId, rideId } = event.pathParameters

    const ride = await DBFindRideById(rideId)
    if (!ride) {
      return Responses._400({ message: "Invalid ride" })
    } else if (ride?.clubId?.toString() !== clubId) {
      return Responses._403({ message: "Forbidden" })
    }

    return Responses._200(ride)
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

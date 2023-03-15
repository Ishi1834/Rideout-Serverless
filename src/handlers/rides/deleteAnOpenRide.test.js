const connectDatabase = require("../../config/dbConn")
const { DBFindRideById } = require("../../utils/database/rides")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")
const { DBRemoveRideFomUser } = require("../../utils/database/users")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { userId } = context.prev
    const { rideId } = event.pathParameters

    const ride = await DBFindRideById(rideId)
    if (!ride) {
      return Responses._400({ message: "Invalid ride" })
    } else if (ride.createdBy.userId.toString() !== userId || ride?.clubId) {
      return Responses._403({ message: "Forbidden" })
    }

    const signedUpCyclists = ride.signedUpCyclists
    signedUpCyclists.forEach((cyclistObject) => {
      DBRemoveRideFomUser(cyclistObject.userId, rideId)
    })
    await ride.deleteOne()

    return Responses._200({
      message: "Ride deleted",
    })
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

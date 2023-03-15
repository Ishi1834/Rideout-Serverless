const connectDatabase = require("../../config/dbConn")
const { DBFindRideById } = require("../../utils/database/rides")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")
const { DBFindUserById } = require("../../utils/database/users")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { userId } = context.prev
    const { clubId, rideId } = event.pathParameters

    const user = await DBFindUserById(userId)
    if (!user) {
      return Responses._400({ message: "Invalid user" })
    }

    const ride = await DBFindRideById(rideId)
    if (!ride) {
      return Responses._400({ message: "Invalid ride" })
    } else if (!ride.openRide && !clubId) {
      return Responses._403({ message: "Forbidden" })
    } else if (ride?.clubId?.toString() !== clubId) {
      return Responses._403({ message: "Forbidden" })
    }

    const userHasJoinedRide = ride.signedUpCyclists.find(
      (cyclistObject) => cyclistObject.userId.toString() === userId
    )
    if (!userHasJoinedRide) {
      return Responses._400({ message: "User hasn't joined ride" })
    }

    ride.signedUpCyclists = ride.signedUpCyclists.filter(
      (cyclistObject) => cyclistObject.userId.toString() !== userId
    )
    await ride.save()
    user.rides = user.rides.filter((id) => id.toString() !== rideId)
    await user.save()

    return Responses._200({ message: "You have left this ride" })
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

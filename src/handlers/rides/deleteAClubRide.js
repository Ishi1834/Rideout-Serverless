const connectDatabase = require("../../config/dbConn")
const { DBFindRideById } = require("../../utils/database/rides")
const Responses = require("../../utils/apiResponses")
const { DBRemoveRideFomUser } = require("../../utils/database/users")
const { DBFindClubById } = require("../../utils/database/clubs")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  await connectDatabase()
  const { userId, userAuthorization } = context.prev
  const { clubId, rideId } = event.pathParameters

  const ride = await DBFindRideById(rideId)
  if (!ride) {
    return Responses._400({ message: "Invalid ride" })
  } else if (ride?.clubId?.toString() !== clubId) {
    return Responses._403({ message: "Forbidden" })
  } else if (
    ride.createdBy.userId.toString() !== userId &&
    userAuthorization !== "admin"
  ) {
    return Responses._403({ message: "Forbidden" })
  }

  const signedUpCyclists = ride.signedUpCyclists
  signedUpCyclists.forEach((cyclistObject) => {
    DBRemoveRideFomUser(cyclistObject.userId, rideId)
  })
  await ride.deleteOne()

  const club = await DBFindClubById(clubId)
  if (club) {
    club.rides = club.rides.filter((id) => id.toString() !== rideId)
    club.activitiesCount -= 1
    await club.save()
  }

  return Responses._200({
    message: "Ride deleted",
  })
}

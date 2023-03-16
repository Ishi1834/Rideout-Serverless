const connectDatabase = require("../../config/dbConn")
const { DBFindUserById } = require("../../utils/database/users")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")
const { DBRemoveUserFromRide } = require("../../utils/database/rides")
const { DBRemoveUserFromClub } = require("../../utils/database/clubs")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { userId } = event.pathParameters

    const user = await DBFindUserById(userId)
    if (!user) {
      return Responses._400({ message: "Invalid user" })
    }

    const userClubs = user.clubs
    userClubs.forEach((clubObject) => {
      DBRemoveUserFromClub(clubObject.clubId, userId)
    })
    const userRides = user.rides
    userRides.forEach((rideId) => {
      DBRemoveUserFromRide(rideId, userId)
    })

    await user.deleteOne()

    return Responses._200({ message: "User deleted" })
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

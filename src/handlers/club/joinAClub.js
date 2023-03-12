const connectDatabase = require("../../config/dbConn")
const { DBFindClubById } = require("../../utils/database/clubs")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")
const { DBFindUserById } = require("../../utils/database/users")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { clubId } = event.pathParameters
    const { userId } = context.prev

    const club = await DBFindClubById(clubId)
    if (!club) {
      return Responses._400({ message: "Invalid club" })
    }

    const user = await DBFindUserById(userId)
    if (!user) {
      return Responses._400({ message: "Invalid user" })
    }

    const userIsClubMember = club.members.find(
      (memberObj) => memberObj.userId.toString() === userId
    )
    if (userIsClubMember) {
      return Responses._400({ message: "User already joined club" })
    }

    const userHasRequestedToJoinClub = club.userRequestingToJoinClub.find(
      (userObj) => userObj.userId.toString() === userId
    )
    if (userHasRequestedToJoinClub) {
      return Responses._400({ message: "User already requested to join club" })
    }

    club.userRequestingToJoinClub.push({
      username: user.username,
      userId: user._id,
    })
    user.clubsRequests.push({
      name: club.name,
      clubId: club._id,
    })
    await club.save()
    await user.save()

    return Responses._200({ message: "Join request sent" })
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

const connectDatabase = require("../../config/dbConn")
const { DBFindClubById } = require("../../utils/database/clubs")
const Responses = require("../../utils/apiResponses")
const { DBFindUserById } = require("../../utils/database/users")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  await connectDatabase()
  const { clubId } = event.pathParameters
  const { userId } = JSON.parse(event.body)

  if (!userId) {
    return Responses._400({ message: "All fields are required" })
  }

  const user = await DBFindUserById(userId)
  if (!user) {
    return Responses._400({ message: "Invalid user" })
  }

  const club = await DBFindClubById(clubId)
  if (!club) {
    return Responses._400({ message: "Invalid club" })
  }

  const userHasRequestedToJoinClub = club.userRequestingToJoinClub.find(
    (userObj) => userObj.userId.toString() === userId
  )
  if (!userHasRequestedToJoinClub) {
    return Responses._400({
      message: "User has not requested to join this club",
    })
  }

  club.members.push({
    username: user.username,
    userId: user._id,
  })
  club.userRequestingToJoinClub = club.userRequestingToJoinClub.filter(
    (userObj) => userObj.userId.toString() !== userId
  )
  club.cyclistCount += 1

  user.clubs.push({
    authorization: "user",
    clubId: club._id,
  })
  user.clubRequests = user.clubRequests.filter(
    (clubObj) => clubObj.clubId.toString() !== clubId
  )

  await club.save()
  await user.save()

  return Responses._200({ message: "User added to club" })
}

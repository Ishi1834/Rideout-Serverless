const connectDatabase = require("../../config/dbConn")
const { DBFindClubById } = require("../../utils/database/clubs")
const Responses = require("../../utils/apiResponses")
const { DBFindUserById } = require("../../utils/database/users")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

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

  club.members = club.members.filter(
    (memberObj) => memberObj.userId.toString() !== userId
  )
  club.cyclistCount -= 1
  user.clubs = user.clubs.filter(
    (clubObj) => clubObj.clubId.toString() !== clubId
  )

  await club.save()
  await user.save()

  return Responses._200({ message: "You have left this club" })
}

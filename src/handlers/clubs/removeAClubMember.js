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

  club.members = club.members.filter(
    (memberObj) => memberObj.userId.toString() !== userId
  )
  club.cyclistCount -= 1
  user.clubs = user.clubs.filter(
    (clubObj) => clubObj.clubId.toString() !== clubId
  )

  await club.save()
  await user.save()

  return Responses._200({ message: "User removed from club" })
}

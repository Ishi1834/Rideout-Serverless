const connectDatabase = require("../../config/dbConn")
const { DBFindClubById } = require("../../utils/database/clubs")
const Responses = require("../../utils/apiResponses")
const { DBFindUserById } = require("../../utils/database/users")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const authorizationLevels = ["user", "editor", "admin"]

  await connectDatabase()
  const { clubId } = event.pathParameters
  const { userId, changeTo } = JSON.parse(event.body)

  if (!userId || !changeTo) {
    return Responses._400({ message: "All fields are required" })
  } else if (!authorizationLevels.includes(changeTo)) {
    return Responses._400({
      message: "ChangeTo should be one of 'user', 'editor' or 'admin'",
    })
  }

  const user = await DBFindUserById(userId)
  if (!user) {
    return Responses._400({ message: "Invalid user" })
  }

  const club = await DBFindClubById(clubId)
  if (!club) {
    return Responses._400({ message: "Invalid club" })
  }

  club.members = club.members.map((memberObj) => {
    if (memberObj.userId.toString() === userId) {
      memberObj.authorization = changeTo
    }
    return memberObj
  })
  user.clubs = user.clubs.map((clubObj) => {
    if (clubObj.clubId.toString() === clubId) {
      clubObj.authorization = changeTo
    }
    return clubObj
  })

  await club.save()
  await user.save()

  return Responses._200({ message: "User role updated" })
}

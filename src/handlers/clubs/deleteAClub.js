const connectDatabase = require("../../config/dbConn")
const { DBRemoveClubFromUser } = require("../../utils/database/users")
const { DBFindClubById } = require("../../utils/database/clubs")
const Responses = require("../../utils/apiResponses")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  await connectDatabase()
  const { clubId } = event.pathParameters

  const club = await DBFindClubById(clubId)
  if (!club) {
    return Responses._400({ message: "Invalid club" })
  }

  const membersArray = club.members
  membersArray.forEach(async (member) => {
    await DBRemoveClubFromUser(member.userId, clubId)
  })

  await club.deleteOne()

  return Responses._200({ message: "Club deleted" })
}

const connectDatabase = require("../../config/dbConn")
const { DBFindUserById } = require("../../utils/database/users")
const { DBFindClubById } = require("../../utils/database/clubs")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { clubId } = event.pathParameters

    const club = await DBFindClubById(clubId)
    if (!club) {
      return Responses._400({ message: "Invalid club" })
    }

    const membersArray = [...club.members]
    membersArray.forEach(async (member) => {
      const user = await DBFindUserById(member.userId)
      if (user) {
        user.clubs = user.clubs.filter(
          (clubObject) => clubObject.clubId.toString() !== clubId
        )
      }
      await user.save()
    })

    await club.deleteOne()

    return Responses._200("Club deleted")
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

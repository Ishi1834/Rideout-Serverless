const connectDatabase = require("../../config/dbConn")
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

  return Responses._200(club)
}

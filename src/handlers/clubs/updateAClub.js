const connectDatabase = require("../../config/dbConn")
const { DBFindClubById } = require("../../utils/database/clubs")
const Responses = require("../../utils/apiResponses")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  await connectDatabase()
  const { clubId } = event.pathParameters
  const { location, tags, description, city } = JSON.parse(event.body)

  if (!location && !tags && !description && !city) {
    return Responses._400({
      message: "Atleast 1 property must be given, to update club",
    })
  }
  if (location && (!Array.isArray(location) || location.length !== 2)) {
    return Responses._400({
      message: "Location should be an array of 2 numbers",
    })
  }
  if (tags && !Array.isArray(tags)) {
    return Responses._400({
      message: "Tags should be an array",
    })
  }

  const club = await DBFindClubById(clubId)
  if (!club) {
    return Responses._400({ message: "Invalid club" })
  }

  if (location) {
    club.location.coordinates = location
  }
  if (city) {
    club.city = city
  }
  if (description) {
    club.description = description
  }
  if (tags) {
    club.tags = tags
  }

  const updatedClub = await club.save()

  return Responses._200({
    message: "Club updated",
    club: updatedClub,
  })
}

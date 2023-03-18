const connectDatabase = require("../../config/dbConn")
const { DBFindClubsNearCoordinates } = require("../../utils/database/clubs")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { maxDistance = 10000, lng, lat } = event.queryStringParameters

    if (!lat || !lng) {
      return Responses._400({ message: "All fields are required" })
    } else if (parseFloat(maxDistance) < 10000) {
      return Responses._400({
        message: "MaxDistance should be greater than 10,000m",
      })
    }

    const clubs = await DBFindClubsNearCoordinates(
      parseFloat(maxDistance),
      parseFloat(lng),
      parseFloat(lat)
    )

    if (clubs.length === 0) {
      return Responses._200({ message: "No clubs found near coordinates" })
    }

    return Responses._200(clubs)
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

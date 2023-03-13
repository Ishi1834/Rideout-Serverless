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
    } else if (
      parseFloat(maxDistance) < 10000 ||
      parseFloat(maxDistance) > 100000
    ) {
      return Responses._400({
        message: "MaxDistance should be between 10,000m and 100,000m",
      })
    }

    const clubs = await DBFindClubsNearCoordinates(maxDistance, lat, lng)

    if (clubs.length === 0) {
      return Responses._200({ message: "No clubs near found" })
    }

    return Responses._200(clubs)
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

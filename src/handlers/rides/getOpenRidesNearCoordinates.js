const connectDatabase = require("../../config/dbConn")
const {
  DBFindUpcomingOpenRidesNearCoordinates,
} = require("../../utils/database/rides")
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

    const rides = await DBFindUpcomingOpenRidesNearCoordinates(
      parseFloat(maxDistance),
      parseFloat(lat),
      parseFloat(lng)
    )
    if (rides.length === 0) {
      return Responses._200({
        message: "There are no upcoming rides, near coordinates",
      })
    }

    return Responses._200(rides)
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

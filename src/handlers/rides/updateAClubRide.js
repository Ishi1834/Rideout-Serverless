const connectDatabase = require("../../config/dbConn")
const { DBFindRideById } = require("../../utils/database/rides")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { userId } = context.prev
    const { clubId, rideId } = event.pathParameters
    const {
      date,
      startLocation,
      rideType,
      distance,
      speed,
      description,
      cafeStops,
      route,
    } = JSON.parse(event.body)

    if (
      !date &&
      !startLocation &&
      !rideType &&
      !distance &&
      !speed &&
      !description &&
      !cafeStops &&
      !route
    ) {
      return Responses._400({
        message: "Atleast 1 property must be given, to update a ride",
      })
    }
    if (
      startLocation &&
      (!Array.isArray(startLocation) || startLocation.length !== 2)
    ) {
      return Responses._400({
        message: "Location should be an array of 2 numbers",
      })
    }

    const ride = await DBFindRideById(rideId)
    if (!ride) {
      return Responses._400({ message: "Invalid ride" })
    } else if (
      ride?.clubId?.toString() !== clubId ||
      ride.createdBy.userId.toString() !== userId
    ) {
      return Responses._403({ message: "Forbidden" })
    }

    if (startLocation) {
      ride.startLocation.coordinates = startLocation
    }
    if (rideType) {
      ride.rideType = rideType
    }
    if (distance) {
      ride.distance = distance
    }
    if (speed) {
      ride.speed = speed
    }
    if (description) {
      ride.description = description
    }
    if (cafeStops) {
      ride.cafeStops = cafeStops
    }
    if (route) {
      ride.route = route
    }

    const updatedRide = await ride.save()

    return Responses._200({
      message: "Ride updated",
      ride: updatedRide,
    })
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

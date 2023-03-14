const connectDatabase = require("../../config/dbConn")
const { DBFindUserById } = require("../../utils/database/users")
const { DBCreateRide } = require("../../utils/database/rides")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { userId } = context.prev
    const {
      date,
      name,
      startLocation,
      rideType,
      distance,
      speed,
      description,
      cafeStops,
      route,
    } = JSON.parse(event.body)

    if (
      !name ||
      !date ||
      !Array.isArray(startLocation) ||
      startLocation.length !== 2 ||
      !rideType ||
      !distance ||
      !speed ||
      !description
    ) {
      return Responses._400({
        message: "All fields are required",
      })
    }

    const user = await DBFindUserById(userId)
    if (!user) {
      return Responses._400({ message: "Invalid user" })
    }

    const ride = await DBCreateRide({
      name,
      createdBy: {
        username: user.username,
        userId: user._id,
      },
      date,
      openRide: true,
      startLocation: {
        type: "Point",
        coordinates: startLocation,
      },
      rideType,
      signedUpCyclists: [
        {
          username: user.username,
          userId: user._id,
        },
      ],
      distance,
      speed,
      description,
      cafeStops: cafeStops ?? "No stops given",
      route: route ?? "No route given",
    })
    user.rides.push(ride._id)

    await user.save()

    return Responses._201({ message: "Ride created", ride })
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

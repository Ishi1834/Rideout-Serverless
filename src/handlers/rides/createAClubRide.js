const connectDatabase = require("../../config/dbConn")
const { DBFindUserById } = require("../../utils/database/users")
const { DBFindClubById } = require("../../utils/database/clubs")
const { DBCreateRide } = require("../../utils/database/rides")
const Responses = require("../../utils/apiResponses")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  await connectDatabase()
  const { userId } = context.prev
  const { clubId } = event.pathParameters
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
  const club = await DBFindClubById(clubId)
  if (!club) {
    return Responses._400({ message: "Invalid club" })
  }

  const ride = await DBCreateRide({
    name,
    createdBy: {
      username: user.username,
      userId: user._id,
    },
    clubId: club._id,
    date,
    openRide: false,
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
  club.rides.push(ride._id)
  user.rides.push(ride._id)

  await club.save()
  await user.save()

  return Responses._201({ message: "Ride created", ride })
}

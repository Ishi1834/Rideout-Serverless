const connectDatabase = require("../../config/dbConn")
const { DBFindUserById } = require("../../utils/database/users")
const { DBCreateClub } = require("../../utils/database/clubs")
const Responses = require("../../utils/apiResponses")
const logger = require("../../utils/logger")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { userId } = context.prev
    const { name, location, city } = JSON.parse(event.body)

    if (
      !name ||
      !city ||
      !location ||
      !Array.isArray(location) ||
      location.length !== 2
    ) {
      return Responses._400({
        message: "All fields are required",
      })
    }

    const user = await DBFindUserById(userId)
    if (!user) {
      return Responses._400({ message: "Invalid user" })
    }

    const club = await DBCreateClub({
      name,
      location: {
        type: "Point",
        coordinates: location,
      },
      city,
      members: [
        { username: user.username, userId: user._id, authorization: "admin" },
      ],
    })

    user.clubs.push({
      authorization: "admin",
      clubId: club._id,
    })
    await user.save()

    return Responses._201({
      message: "Club created",
      club,
    })
  } catch (error) {
    logger(error)
    return Responses._500({ error: error?.message })
  }
}

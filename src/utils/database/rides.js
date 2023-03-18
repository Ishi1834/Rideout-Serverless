const Ride = require("../../models/Ride")

const DBCreateRide = async (rideObject) => {
  const ride = await Ride.create(rideObject)
  return ride
}

const DBFindRideById = async (rideId) => {
  const ride = await Ride.findById(rideId)
  return ride
}

const DBFindUpcomingRidesByClubId = async (clubId) => {
  const todaysDate = new Date()
  const rides = await Ride.find({
    clubId: clubId,
    date: { $gte: todaysDate },
  }).sort({ date: -1 })
  return rides
}

const DBFindUpcomingOpenRidesNearCoordinates = async (
  maxDistance,
  lng,
  lat
) => {
  const todaysDate = new Date()

  const rides = await Ride.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng, lat],
        },
        key: "startLocation.coordinates",
        distanceField: "distanceToClub",
        maxDistance: maxDistance,
        spherical: true,
      },
    },
    {
      $match: { date: { $gte: todaysDate }, openRide: true },
    },
    {
      $sort: { date: 1 },
    },
  ])
  return rides
}

const DBRemoveUserFromRide = async (rideId, userId) => {
  const ride = await Ride.findById(rideId)
  ride.signedUpCyclists = ride.signedUpCyclists.filter(
    (cyclistObject) => cyclistObject.userId.toString() !== userId
  )
  await ride.save()
}

module.exports = {
  DBCreateRide,
  DBFindRideById,
  DBFindUpcomingRidesByClubId,
  DBFindUpcomingOpenRidesNearCoordinates,
  DBRemoveUserFromRide,
}

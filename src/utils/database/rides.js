const { TrackingOptionsDoesNotExistException } = require("@aws-sdk/client-ses")
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
  lat,
  lng
) => {
  /* 
  const todaysDate = new Date()
  add filter for date and sorting
   */
  const rides = await Ride.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng, lat],
        },
        key: "location.coordinates",
        distanceField: "distanceToClub",
        maxDistance: maxDistance,
        spherical: true,
      },
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

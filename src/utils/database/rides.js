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

module.exports = { DBCreateRide, DBFindRideById, DBFindUpcomingRidesByClubId }

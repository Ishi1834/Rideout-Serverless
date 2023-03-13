const Ride = require("../../models/Ride")

const DBCreateRide = async (rideObject) => {
  const ride = await Ride.create(rideObject)
  return ride
}

const DBFindRideById = async (rideId) => {
  const ride = await Ride.findById(rideId)
  return ride
}

module.exports = { DBCreateRide, DBFindRideById }

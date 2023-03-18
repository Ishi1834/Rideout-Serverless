const {
  DBCreateRide,
  DBFindRideById,
  DBFindUpcomingRidesByClubId,
  DBFindUpcomingOpenRidesNearCoordinates,
} = require("./rides")
const mongoose = require("mongoose")
const Ride = require("../../models/Ride")

const userId = new mongoose.Types.ObjectId()
const rideId = new mongoose.Types.ObjectId()
const todaysDate = new Date()

const baseTestRide = {
  name: "name",
  createdBy: {
    username: "username",
    userId: userId,
  },
  date: todaysDate,
  startLocation: {
    type: "Point",
    coordinates: [40, 60],
  },
  rideType: "Social",
  distance: 40,
  speed: 25,
  signedUpCyclists: [],
  description: "description",
}

beforeEach(() => {
  Ride.ensureIndexes(function (err) {
    if (err) console.log(err)
  })

  Ride.on("index", function (err) {
    if (err) console.log(err)
  })
})

describe("Database Ride helper functions work correctly", () => {
  describe("DBCreateRide works correctly", () => {
    test("Ride is saved to DB successfully", async () => {
      const savedRide = await DBCreateRide({
        _id: rideId,
        ...baseTestRide,
      })

      expect(savedRide).toMatchObject({
        _id: rideId,
        ...baseTestRide,
      })
    })
  })

  describe("DBFindRideById works correctly", () => {
    test("Ride is returned if given rideId has associated ride", async () => {
      await Ride.create({
        _id: rideId,
        ...baseTestRide,
      })

      const ride = await DBFindRideById(rideId)

      expect(ride).toMatchObject({
        _id: rideId,
        ...baseTestRide,
      })
    })
  })

  describe("DBFindUpcomingRidesByClubId works correctly", () => {
    test("Upcoming rides from club are returned in correctly order", async () => {
      const clubId = new mongoose.Types.ObjectId()
      const dateInFuture = Date.now() + 100000
      const dateInPast = Date.now() - 100000
      const ride1 = {
        ...baseTestRide,
        date: dateInFuture,
        clubId: clubId,
      }
      const ride2 = {
        ...baseTestRide,
        date: dateInFuture,
        clubId: clubId,
      }
      const ride3 = {
        ...baseTestRide,
        date: dateInPast,
        clubId: clubId,
      }
      const ride4 = {
        ...baseTestRide,
        date: dateInFuture,
        clubId: new mongoose.Types.ObjectId(),
      }
      const allRidesInDB = [ride1, ride2, ride3, ride4]
      await Ride.create(allRidesInDB)

      const upcomingClubRides = await DBFindUpcomingRidesByClubId(clubId)

      upcomingClubRides.forEach((ride) => {
        expect(ride.clubId).toEqual(clubId)
        expect(new Date(ride.date).getTime()).toBeGreaterThan(
          new Date().getTime()
        )
      })
    })
  })

  describe("DBFindUpcomingOpenRidesNearCoordinates works correctly", () => {
    test("Upcoming rides near given coordinates are returned", async () => {
      const clubId = new mongoose.Types.ObjectId()
      const dateInFuture = Date.now() + 100000
      const dateInPast = Date.now() - 100000
      const ride1 = {
        ...baseTestRide,
        date: dateInFuture,
        clubId: clubId,
        startLocation: {
          type: "Point",
          coordinates: [40.012, 59.99],
        },
        openRide: false,
      }
      const ride2 = {
        ...baseTestRide,
        date: dateInFuture + 35000,
        clubId: clubId,
        startLocation: {
          type: "Point",
          coordinates: [40.132, 60.01],
        },
        openRide: true,
      }
      const ride3 = {
        ...baseTestRide,
        date: dateInPast,
        startLocation: {
          type: "Point",
          coordinates: [40.012, 59.99],
        },
        openRide: true,
      }
      const ride4 = {
        ...baseTestRide,
        date: dateInFuture,
        openRide: true,
      }
      const allRidesInDB = [ride1, ride2, ride3, ride4]
      await Ride.create(allRidesInDB)

      const upcomingOpenRides = await DBFindUpcomingOpenRidesNearCoordinates(
        30000,
        40,
        60
      )

      expect(upcomingOpenRides).toHaveLength(2)
      upcomingOpenRides.forEach((ride) => {
        expect(ride.openRide).toBe(true)
        expect(new Date(ride.date).getTime()).toBeGreaterThan(
          new Date().getTime()
        )
      })
    })
  })
})

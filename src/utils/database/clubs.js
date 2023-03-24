const Club = require("../../models/Club")

const DBCreateClub = async (clubObject) => {
  const club = await Club.create(clubObject)
  return club
}

const DBFindClubById = async (clubId) => {
  const club = await Club.findById(clubId)
  return club
}

const DBFindClubsNearCoordinates = async (maxDistance, lng, lat) => {
  const clubs = await Club.aggregate([
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
  return clubs
}

const DBRemoveUserFromClub = async (clubId, userId) => {
  const club = await Club.findById(clubId)
  if (!club) return
  club.members = club.members.filter(
    (memberObject) => memberObject.userId.toString() !== userId
  )
  await club.save()
}

module.exports = {
  DBCreateClub,
  DBFindClubById,
  DBFindClubsNearCoordinates,
  DBRemoveUserFromClub,
}

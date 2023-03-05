const Club = require("../../models/Club")

const DBCreateClub = async (clubObject) => {
  const club = await Club.create(clubObject)
  return club
}

const DBFindClubById = async (clubId) => {
  const club = await Club.findById(clubId)
  return club
}

module.exports = { DBCreateClub, DBFindClubById }

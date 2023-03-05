const Club = require("../../models/Club")

const createClub = async (clubObject) => {
  const club = await Club.create(clubObject)
  return club
}

const findClubById = async (clubId) => {
  const club = await Club.findById(clubId)
  return club
}

module.exports = { createClub, findClubById }

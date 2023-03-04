const Club = require("../../models/Club")

const createClub = async (clubObject) => {
  const club = await Club.create(clubObject)
  return club
}

module.exports = { createClub }

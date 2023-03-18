const {
  DBCreateClub,
  DBFindClubById,
  DBRemoveUserFromClub,
} = require("./clubs")
const mongoose = require("mongoose")
const Club = require("../../models/Club")

const baseTestClub = {
  name: "name",
  location: {
    type: "Point",
    coordinates: [50, 50],
  },
  city: "city",
  cyclistCount: 0,
  activitiesCount: 0,
  rides: [],
  members: [],
}

describe("Database Club helper functions work correctly", () => {
  describe("DBCreateClub works correctly", () => {
    test("Club is saved to DB successfully", async () => {
      const savedClub = await DBCreateClub(baseTestClub)

      expect(savedClub).toMatchObject(baseTestClub)
    })
  })

  describe("DBFindClubById works correctly", () => {
    test("Club is returned from DB if given clubId has an existing club", async () => {
      const { _id } = await Club.create(baseTestClub)

      const club = await DBFindClubById(_id)

      expect(club).toMatchObject(baseTestClub)
    })

    test("Null is returned from DB if given clubId doesn't have an existing club", async () => {
      const club = await DBFindClubById("randomstring")

      expect(club).toBe(null)
    })
  })

  describe("DBRemoveUserFromClub works correctly", () => {
    test("User is removed from club correctly", async () => {
      const userId = new mongoose.Types.ObjectId()
      const testClub = {
        ...baseTestClub,
        members: [
          {
            userId,
            username: "username",
            authorization: "user",
          },
        ],
      }
      const { _id } = await Club.create(testClub)

      await DBRemoveUserFromClub(_id, userId.toString())

      const club = await Club.findById(_id)

      expect(club).toMatchObject({
        ...baseTestClub,
        members: [],
      })
    })
  })
})

const {
  DBCheckUsernameOrEmailIsTaken,
  DBCreateUser,
  DBFindUser,
  DBFindUserById,
  DBRemoveRideFomUser,
} = require("./users")
const mongoose = require("mongoose")
const User = require("../../models/User")

const baseTestUser = {
  username: "username",
  name: "name",
  password: "password",
  email: "email",
}

describe("Database User helper function works correctly", () => {
  describe("DBCheckUsernameOrEmailIsTaken works correctly", () => {
    test("Returns 'email' if email is duplicate", async () => {
      await User.create(baseTestUser)

      const duplicate = await DBCheckUsernameOrEmailIsTaken({
        username: "not duplicate username",
        email: "email",
      })

      expect(duplicate).toBe("email")
    })

    test("Returns 'username' if username is duplicate", async () => {
      await User.create(baseTestUser)

      const duplicate = await DBCheckUsernameOrEmailIsTaken({
        username: "username",
        email: "not duplicate email",
      })

      expect(duplicate).toBe("username")
    })

    test("Returns null if username and email are not duplicates", async () => {
      const duplicate = await DBCheckUsernameOrEmailIsTaken({
        username: "username",
        email: "email",
      })

      expect(duplicate).toBe(null)
    })
  })

  describe("DBCreateUser works correctly", () => {
    test("user saved to DB successfully", async () => {
      const savedUser = await DBCreateUser(baseTestUser)

      expect(savedUser).toMatchObject(baseTestUser)
    })
  })

  describe("DBFindUser works correctly", () => {
    test("user is returned if user exists in DB", async () => {
      await User.create(baseTestUser)

      const user = await DBFindUser({ username: baseTestUser.username })

      expect(user).toMatchObject(baseTestUser)
    })

    test("null is returned if user doesn't in DB", async () => {
      const user = await DBFindUser({ username: baseTestUser.username })

      expect(user).toBe(null)
    })
  })

  describe("DBFindUserById works correctly", () => {
    test("user is returned if user exists in DB", async () => {
      const { _id } = await User.create(baseTestUser)

      const user = await DBFindUserById(_id.toString())

      expect(user).toMatchObject(baseTestUser)
    })

    test("null is returned if user doesn't in DB", async () => {
      const user = await DBFindUserById("randomstring")

      expect(user).toBe(null)
    })
  })

  describe("DBRemoveRideFomUser works correctly", () => {
    test("Ride is removed if user has ride", async () => {
      const rideId = new mongoose.Types.ObjectId()
      const testUser = {
        ...baseTestUser,
        rides: [rideId],
      }
      const { _id } = await User.create(testUser)

      await DBRemoveRideFomUser(_id, rideId.toString())

      const user = await User.findById(_id)

      expect(user).toMatchObject({
        ...testUser,
        rides: [],
      })
    })
  })
})

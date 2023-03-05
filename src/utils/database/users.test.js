const {
  DBCheckUsernameOrEmailIsTaken,
  DBCreateUser,
  DBFindUser,
  DBFindUserById,
} = require("./users")
const User = require("../../models/User")

const testUser = {
  username: "username",
  name: "name",
  password: "password",
  email: "email",
}

describe("All function that interact with DB work correctly", () => {
  describe("DBCheckUsernameOrEmailIsTaken works correctly", () => {
    test("Returns 'email' if email is duplicate", async () => {
      await User.create(testUser)

      const duplicate = await DBCheckUsernameOrEmailIsTaken({
        username: "not duplicate username",
        email: "email",
      })

      expect(duplicate).toBe("email")
    })

    test("Returns 'username' if username is duplicate", async () => {
      await User.create(testUser)

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
      const savedUser = await DBCreateUser(testUser)

      expect(savedUser).toMatchObject(testUser)
    })
  })

  describe("DBFindUser works correctly", () => {
    test("user is returned if user exists in DB", async () => {
      await User.create(testUser)

      const user = await DBFindUser({ username: testUser.username })

      expect(user).toMatchObject(testUser)
    })

    test("null is returned if user doesn't in DB", async () => {
      const user = await DBFindUser({ username: testUser.username })

      expect(user).toBe(null)
    })
  })

  describe("DBFindUserById works correctly", () => {
    test("user is returned if user exists in DB", async () => {
      const { _id } = await User.create(testUser)

      const user = await DBFindUserById(_id.toString())

      expect(user).toMatchObject(testUser)
    })

    test("null is returned if user doesn't in DB", async () => {
      const user = await DBFindUserById("randomstring")

      expect(user).toBe(null)
    })
  })
})

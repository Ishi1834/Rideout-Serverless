const {
  checkUsernameEmailIsTaken,
  createUser,
  findUser,
  findUserById,
} = require("./users")
const User = require("../../models/User")

const testUser = {
  username: "username",
  name: "name",
  password: "password",
  email: "email",
}

describe("All function that interact with DB work correctly", () => {
  describe("CheckUsernameEmailIsTaken works correctly", () => {
    test("Returns 'email' if email is duplicate", async () => {
      await User.create(testUser)

      const duplicate = await checkUsernameEmailIsTaken({
        username: "not duplicate username",
        email: "email",
      })

      expect(duplicate).toBe("email")
    })

    test("Returns 'username' if username is duplicate", async () => {
      await User.create(testUser)

      const duplicate = await checkUsernameEmailIsTaken({
        username: "username",
        email: "not duplicate email",
      })

      expect(duplicate).toBe("username")
    })

    test("Returns null if username and email are not duplicates", async () => {
      const duplicate = await checkUsernameEmailIsTaken({
        username: "username",
        email: "email",
      })

      expect(duplicate).toBe(null)
    })
  })

  describe("CreateUser works correctly", () => {
    test("user saved to DB successfully", async () => {
      const savedUser = await createUser(testUser)

      expect(savedUser).toMatchObject(testUser)
    })
  })

  describe("FindUser works correctly", () => {
    test("user is returned if user exists in DB", async () => {
      await User.create(testUser)

      const user = await findUser({ username: testUser.username })

      expect(user).toMatchObject(testUser)
    })

    test("null is returned if user doesn't in DB", async () => {
      const user = await findUser({ username: testUser.username })

      expect(user).toBe(null)
    })
  })

  describe("FindUserById works correctly", () => {
    test("user is returned if user exists in DB", async () => {
      const { _id } = await User.create(testUser)

      const user = await findUserById(_id.toString())

      expect(user).toMatchObject(testUser)
    })

    test("null is returned if user doesn't in DB", async () => {
      const user = await findUserById("randomstring")

      expect(user).toBe(null)
    })
  })
})

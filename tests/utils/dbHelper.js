const User = require("../../src/models/User")
const bcrypt = require("bcrypt")

const addUserToDB = async (userObject) => {
  const hashedPwd = await bcrypt.hash(userObject.password, 10)
  await User.create({
    ...userObject,
    password: hashedPwd,
  })
}

module.exports = {
  addUserToDB,
}

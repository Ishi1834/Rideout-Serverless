const User = require("../../models/User")

const checkUsernameEmailIsTaken = async ({ username, email }) => {
  const duplicate = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  })
    .lean()
    .exec()
  if (duplicate && duplicate.email === email.toLowerCase()) {
    return "email"
  } else if (duplicate && duplicate.username === username.toLowerCase()) {
    return "username"
  }
  return null
}

const saveUser = async (userObject) => {
  const user = await User.create(userObject)
  return user
}

const findUser = async (userObject) => {
  const user = await User.findOne(userObject).lean()
  return user
}

const findUserById = async (userId) => {
  const user = await User.findById(userId)
  return user
}

module.exports = {
  checkUsernameEmailIsTaken,
  saveUser,
  findUser,
  findUserById,
}

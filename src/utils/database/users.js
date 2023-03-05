const User = require("../../models/User")

const DBCheckUsernameOrEmailIsTaken = async ({ username, email }) => {
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

const DBCreateUser = async (userObject) => {
  const user = await User.create(userObject)
  return user
}

const DBFindUser = async (userObject) => {
  const user = await User.findOne(userObject).lean()
  return user
}

const DBFindUserById = async (userId) => {
  const user = await User.findById(userId)
  return user
}

module.exports = {
  DBCheckUsernameOrEmailIsTaken,
  DBCreateUser,
  DBFindUser,
  DBFindUserById,
}

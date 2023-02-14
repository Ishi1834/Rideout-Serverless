const User = require("../models/User")

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
  const user = await User.create(userObject).exec()
  return user
}

module.exports = {
  checkUsernameEmailIsTaken,
  saveUser,
}

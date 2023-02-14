const connectDatabase = require("../../database/dbConn")
const User = require("../../models/User")
const bcrypt = require("bcrypt")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    await connectDatabase()
    const { username, name, password, email } = JSON.parse(event.body)

    if (!username || !password || !name || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "All fields are required" }),
      }
    }

    // Check for duplicate
    const duplicate = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    })
      .lean()
      .exec()

    if (duplicate && duplicate.email === email.toLowerCase()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Duplicate email" }),
      }
    } else if (duplicate && duplicate.username === username.toLowerCase()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Duplicate username" }),
      }
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject = {
      username: username.toLowerCase(),
      password: hashedPwd,
      name,
      email: email.toLowerCase(),
    }

    // Create and store new user
    const user = await User.create(userObject)
    return {
      statusCode: 201,
      body: JSON.stringify(user),
    }
  } catch (error) {
    console.log(error)
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

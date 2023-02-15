const connectDatabase = require("../../database/dbConn")
const bcrypt = require("bcrypt")
const {
  checkUsernameEmailIsTaken,
  saveUser,
} = require("../../utils/database/users")

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
    const duplicateProperty = await checkUsernameEmailIsTaken({
      username,
      email,
    })

    if (duplicateProperty === "email" || duplicateProperty === "username") {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: `Duplicate ${duplicateProperty}` }),
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
    const user = await saveUser(userObject)
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

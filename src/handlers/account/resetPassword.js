const connectDatabase = require("../../config/dbConn")
const bcrypt = require("bcrypt")
const { DBFindUser } = require("../../utils/database/users")
const Responses = require("../../utils/apiResponses")
const sendEmail = require("../../utils/sendEmail")
const generator = require("generate-password")
const { generatePasswordResetContent } = require("../../utils/emailContent")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  await connectDatabase()
  const { username } = JSON.parse(event.body)

  if (!username) {
    return Responses._400({
      message: "All fields are required",
    })
  }

  const user = await DBFindUser({ username })
  if (!user) {
    return Responses._400({ message: "Invalid username" })
  }

  const temporaryPassword = generator.generate({
    length: 10,
    numbers: true,
  })

  // Hash password
  const hashedPwd = await bcrypt.hash(temporaryPassword, 10)

  user.password = hashedPwd
  await user.save()

  await sendEmail(
    user.email,
    "Reset your password",
    generatePasswordResetContent(user.name, temporaryPassword)
  )

  return Responses._200({
    message: "Email sent",
  })
}

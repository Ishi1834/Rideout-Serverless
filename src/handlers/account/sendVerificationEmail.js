const connectDatabase = require("../../config/dbConn")
const { verificationTokenSecret } = require("../../config/secretHandler")
const { DBFindUserById } = require("../../utils/database/users")
const Responses = require("../../utils/apiResponses")
const jwt = require("jsonwebtoken")
const sendEmail = require("../../utils/sendEmail")
const { generateVerificationContent } = require("../../utils/emailContent")

module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false
  const { host } = event.headers

  await connectDatabase()
  const { userId } = JSON.parse(event.body)

  if (!userId) {
    return Responses._400({
      message: "All fields are required",
    })
  }

  const user = await DBFindUserById(userId)
  if (!user) {
    return Responses._400({ message: "Invalid userId" })
  }

  const verificationToken = jwt.sign(
    {
      userId: user._id,
    },
    verificationTokenSecret,
    { expiresIn: "1h" }
  )
  const verificationURL = `https://${host}/account/verification/${verificationToken}`

  await sendEmail(
    user.email,
    "Confirm your email",
    generateVerificationContent(user.name, verificationURL)
  )

  return Responses._200({ message: "Email has been sent" })
}

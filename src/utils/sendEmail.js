const nodemailer = require("nodemailer")
const aws = require("@aws-sdk/client-ses")
const { defaultProvider } = require("@aws-sdk/credential-provider-node")

const ses = new aws.SES({
  apiVersion: "2010-12-01",
  region: "eu-west-2",
  defaultProvider,
})

const transporter = nodemailer.createTransport({
  SES: { ses, aws },
})

const sendEmail = async (toEmail, subject, text) =>
  new Promise((resolve, reject) => {
    transporter.sendMail(
      {
        from: process.env.FROM_EMAIL,
        to: toEmail,
        subject: subject,
        text: text,
      },
      (err, info) => {
        if (err) {
          reject(err)
        }
        if (info) {
          resolve(info)
        }
      }
    )
  })

module.exports = sendEmail

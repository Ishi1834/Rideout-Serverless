const generateVerificationContent = (name, verificationURL) => {
  return `Dear ${name},

  Welcome to RideOut! We're glad you decided to join us.
  
  To complete your account set up and start using our platform, please click the link below to verify your email address:
  
  ${verificationURL}

  Please note that this link will expire in 1 hour, so be sure to click on it as soon as possible.
  
  By verifying your email, you'll be able to take advantage of all the benefits RideOut has to offer, including:
  
  Access to join clubs and rides
  Receiving important updates and notifications
  Personalized experience tailored to your needs
  
  We take your privacy and security seriously, which is why we require email verification.
  
  If you have any issues or questions, don't hesitate to reach out to our support team at clubrideout@gmail.com.
  
  Best regards,
  
  The RideOut Team
  
  `
}

const generatePasswordResetContent = (name, temporaryPassword) => {
  return `Dear ${name},

  We have received your request to reset your password. To change your password, please use the following temporary passcode: ${temporaryPassword}.
  
  To change your password, please follow these steps:
  
  1. Log into the app using the temporary passcode.
  2. Once you are logged in, navigate to the 'Profile' section.
  3. Select the option to 'Change Password'.
  4. Enter your temporary password and new password.
  5. Click 'Submit' to complete the process.
  
  If you have any difficulties, please don't hesitate to reach out to our support team for assistance.
  
  Thank you for using our app.
  
  Best regards,
  
  The RideOut Team
  
  `
}

module.exports = { generateVerificationContent, generatePasswordResetContent }

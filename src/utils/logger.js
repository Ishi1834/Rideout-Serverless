const logger = (message) => {
  if (process.env.NODE_ENV === "test") {
    return
  }
  console.log(message)
}

module.exports = logger

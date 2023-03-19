const mongoose = require("mongoose")
const { dbURI } = require("./secretHandler")

let conn = null

const connectDatabase = async () => {
  if (conn == null) {
    // create new connection if no connection exists
    conn = await mongoose.connect(dbURI, { serverSelectionTimeoutMS: 5000 })
    return conn
  }
  // return existing connection
  return conn
}

module.exports = connectDatabase

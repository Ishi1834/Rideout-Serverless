const mongoose = require("mongoose")

let conn = null

const uri = process.env.DATABASE_URI

mongoose.set("strictQuery", false)

module.exports = connectDatabase = async () => {
  if (process.env.NODE_ENV === "test") {
    return
  }
  if (conn == null) {
    // create new connection if no connection exists
    conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    return conn
  }
  // return existing connection
  return conn
}

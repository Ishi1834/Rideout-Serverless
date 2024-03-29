const { MongoMemoryServer } = require("mongodb-memory-server")
const mongoose = require("mongoose")
const config = require("./dbConfig")

mongoose.set("strictQuery", false)

const globalSetup = async () => {
  if (config.Memory) {
    // Config to decided if an mongodb-memory-server instance should be used
    // it's needed in global space, because we don't want to create a new instance every test-suite
    const instance = await MongoMemoryServer.create()
    const uri = instance.getUri()

    global.__MONGOINSTANCE = instance
    process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf("/"))
  } else {
    process.env.MONGO_URI = `mongodb://${config.IP}:${config.Port}`
  }

  // The following is to make sure the database is clean before an test starts
  await mongoose.connect(`${process.env.MONGO_URI}/${config.Database}`)
  await mongoose.connection.db.dropDatabase()
  await mongoose.disconnect()
}

module.exports = globalSetup

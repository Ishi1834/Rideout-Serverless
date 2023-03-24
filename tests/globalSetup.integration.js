const { setup: setupDevServer } = require("jest-dev-server")
const { MongoMemoryServer } = require("mongodb-memory-server")
const mongoose = require("mongoose")
const config = require("./dbConfig")

module.exports = async function globalSetup() {
  if (config.Memory) {
    // Config to decided if an mongodb-memory-server instance should be used
    // it's needed in global space, because we don't want to create a new instance every test-suite
    const instance = await MongoMemoryServer.create({
      instance: {
        port: config.Port,
        ip: config.IP,
      },
    })
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

  globalThis.servers = await setupDevServer({
    command: "sls offline start --verbose",
    launchTimeout: 50000,
    port: 3000,
  })
}

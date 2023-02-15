const { MongoMemoryServer } = require("mongodb-memory-server")
const mongoose = require("mongoose")

beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create()

  await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoose.connection.close()
})
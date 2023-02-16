const mongoose = require("mongoose")

mongoose.set("strictQuery", false)

beforeAll(async () => {
  await mongoose.connect(process.env["MONGO_URI"])
})

afterEach(async () => {
  await mongoose.connection.db.dropDatabase()
})

afterAll(async () => {
  await mongoose.disconnect()
})

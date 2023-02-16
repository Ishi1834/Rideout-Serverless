const mongoose = require("mongoose")

mongoose.set("strictQuery", false)

beforeAll(async () => {
  await mongoose.connect(process.env["MONGO_URI"])
})

afterAll(async () => {
  await mongoose.disconnect()
})

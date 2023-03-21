const connectDatabase = require("./dbConn")
const mongoose = require("mongoose")

jest.mock("mongoose")

describe("connectDatabase function works correctly", () => {
  test("If connection doesn't exist, open a new database connection", async () => {
    await connectDatabase()
    expect(mongoose.connect).toHaveBeenCalledWith("mongodb://127.0.0.1:27017", {
      serverSelectionTimeoutMS: 5000,
    })
  })
})

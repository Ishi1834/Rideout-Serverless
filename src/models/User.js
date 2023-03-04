const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  rides: [
    {
      name: String,
      rideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride",
      },
    },
  ],
  clubsRequests: [
    {
      name: String,
      clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
      },
    },
  ],
  clubs: [
    {
      authorization: {
        type: String,
        enum: ["user", "editor", "admin"],
        default: "user",
      },
      clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
      },
    },
  ],
  reportedContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReportedContent",
    },
  ],
  emailVerified: {
    type: Boolean,
    default: false,
    enum: [false, true],
  },
})

module.exports = mongoose.model("User", userSchema)

const mongoose = require("mongoose")

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: "",
  },
  userRequestingToJoinClub: [
    {
      userName: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
      required: true,
    },
  },
  city: {
    type: String,
    default: "",
  },
  tags: {
    type: [
      {
        type: String,
        enum: [
          "Road Cycling",
          "Mountain Biking",
          "Touring",
          "Casual",
          "Weeked",
          "Mid-week",
          "Over 50",
          "Women Only",
        ],
      },
    ],
  },
  cyclistCount: {
    type: Number,
    default: 1,
  },
  activitiesCount: {
    type: Number,
    default: 0,
  },
  rides: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
    },
  ],
  members: [
    {
      username: String,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      authorization: {
        type: String,
        enum: ["user", "editor", "admin"],
        default: "user",
      },
    },
  ],
})

module.exports = mongoose.model("Club", clubSchema)

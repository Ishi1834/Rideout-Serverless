const mongoose = require("mongoose")

const rideSchema = new mongoose.Schema(
  {
    createdBy: {
      username: {
        type: String,
        required: true,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
    name: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    openRide: {
      type: Boolean,
      default: false,
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
    },
    startLocation: {
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
    rideType: {
      type: String,
      enum: ["Social", "Training", "Chaingang", "Virtual"],
      default: "Social",
    },
    distance: {
      type: Number,
      required: true,
    },
    speed: {
      type: Number,
      required: true,
    },
    cafeStops: {
      type: String,
    },
    signedUpCyclists: [
      {
        username: String,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    description: {
      type: String,
      required: true,
    },
    route: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)
// To improve queries indexes should be added for
// - timestamps<createdAt>
// - clubId
// - date
module.exports = mongoose.model("Ride", rideSchema)

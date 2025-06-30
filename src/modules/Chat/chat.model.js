const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    loadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Load",
      required: true,
    },
    chatType: {
      type: String,
      enum: ["shipper-receiver", "shipper-driver", "driver-receiver"],
    },
    status: {
      type: String,
      enum: ["accepted", "blocked"],
      default: "accepted",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);

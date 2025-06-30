const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    }],
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

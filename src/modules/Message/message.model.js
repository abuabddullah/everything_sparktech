const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    message: { type: String, required: false },
    type: { type: String, enum: ["general", "special", "reply"], default: "general" },
    meetingTime: { type: Date, required: false },
    duration: { type: Number, required: false },
    link: { type: String, required: false },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);

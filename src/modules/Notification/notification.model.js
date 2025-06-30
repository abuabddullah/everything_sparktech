const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: false },
    linkId: { type: String, required: false },
    type: {
      type: String,
      enum: [
        "load-request",
        "feedback",
        "load",
        "nearby-load",
        "technical-issue",
        "admin",
        "message",
      ],
      required: false,
    },
    role: { type: String, enum: ["admin", "user", "driver"], default: "user" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

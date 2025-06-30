const mongoose = require("mongoose");

const receiverSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  loadId: { type: mongoose.Schema.Types.ObjectId, ref: "Load", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, trim: true, unique: false },
});

module.exports = mongoose.model("Receiver", receiverSchema);

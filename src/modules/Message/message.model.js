const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    sender: {
      type: String,
      required: true,
    },
    // sender: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: 'User',
    // },
    // receiver: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: 'Receiver',
    // },
    // loadId: {
    //   type: mongoose.Schema.Types.ObjectId || null,
    //   required: false,
    //   ref: 'Load',
    //   default: null,
    // },
    showButton: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);

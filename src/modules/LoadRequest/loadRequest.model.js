const mongoose = require("mongoose");

const loadRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // have to remove
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    load: { type: mongoose.Schema.Types.ObjectId, ref: "Load" },
    truck: { type: mongoose.Schema.Types.ObjectId, ref: "Truck" },
    shippingId: { type: String, require: true },
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Picked",
        "Rejected",
        "Delivered",
        "Delivery-Pending",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LoadRequest", loadRequestSchema);

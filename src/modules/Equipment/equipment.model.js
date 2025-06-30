const { unique } = require("agenda/dist/job/unique");
const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["truck", "trailer"], required: false },
    cdlNumber: {
      type: String,
      required: false,
      trim: true,
      // unique: true,
    },
    truckNumber: {
      type: String,
      required: false,
      trim: true,
      // unique: true,
    },
    trailerSize: { type: Number, default: 0, required: false, trim: true },
    palletSpace: {
      type: Number,
      default: 0,
      required: [true, "Pallet Space must be given"],
      trim: true,
    },
    weight: {
      type: Number,
      default: 0,
      required: [true, "Weight must be given"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Equipment", equipmentSchema);

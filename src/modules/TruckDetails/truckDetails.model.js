const mongoose = require("mongoose");

const truckDetailSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cdlNumber: {
      type: String,
      required: [false, "CDL Number must be given"],
      unique: true,
      trim: true,
    },
    truckNumber: { type: String, required: false, unique: true, trim: true },
    trailerSize: { type: Number, default: 0, required: false, trim: true },
    palletSpace: {
      type: Number,
      default: 0,
      required: [true, "Pallet Space must be given"],
      trim: true,
    },
    availablePalletSpace: {
      type: Number,
      default: 0,
      required: false,
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

// Middleware to initialize `availablePalletSpace` with the value of `palletSpace`
truckDetailSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("palletSpace")) {
    this.availablePalletSpace = this.palletSpace;
  }
  next();
});

module.exports = mongoose.model("Truck", truckDetailSchema);

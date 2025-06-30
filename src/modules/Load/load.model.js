const mongoose = require("mongoose");

const loadSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    shipperName: { type: String, required: true },
    shipperPhoneNumber: { type: String, required: true },
    shipperEmail: { type: String, required: true },

    // changes will be here
    shippingAddress: { type: String, required: true },
    shippingCity: { type: String, required: true },
    shippingState: { type: String, required: true },
    shippingZip: { type: String, required: true },

    // load detailse
    palletSpace: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    loadType: { type: String, required: false },
    trailerSize: { type: Number, required: true },
    productType: { type: String, required: false },
    //isHazmat: { type: Boolean, default: false , required: false },
    Hazmat: {
      type: [String],
      enum: [
        "Hazmat",
        "Dangerous",
        "Flammable Gas 2",
        "Poson 6",
        "Corrosive",
        "Oxygen2",
        "Dangerous",
        "Flamable 3",
        "Radioactive",
        "Non-Flammable",
      ],
      required: false,
      trim: true,
    },
    description: { type: String, required: false },
    shipmentPayment: { type: Number, default: 0 },

    // receiver end
    // receiverId: { type: String, require: true },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Receiver",
      required: false,
    },
    receiverName: { type: String, required: true },
    receiverPhoneNumber: { type: String, required: true },
    receiverEmail: { type: String, required: true, unique: false },

    // changes will be here
    receivingAddress: { type: String, required: true },
    receiverCity: { type: String, required: true },
    receiverState: { type: String, required: true },
    receiverZip: { type: String, required: true },
    poNumber: { type: Number, required: true },

    pickupDate: { type: String, required: true },
    deliveryDate: { type: String, required: true },
    // pickupTime: { type: String, required: true },
    // deliveryTime: { type: String, required: true },

    billOfLading: { type: String, required: true },
    deliveryInstruction: { type: String, required: false },
    isAssigned: { type: Boolean, default: false },

    //chat id of shipper to receiver and shipper to driver. this model updated by rasel
    shipperToReceiverChatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: false,
    },
    shipperToDriverChatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: false,
    },
    driverToReceiverChatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: false,
    },

    // location: {
    //   type: {
    //     type: String,
    //     enum: ['Point'],
    //     required: false
    //   },
    //   coordinates: {
    //     type: [Number],
    //     required: false
    //   }
    // },

    receiverLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: false,
      },
      coordinates: {
        type: [Number],
        required: false,
      },
    },
    
    shipperLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: false,
      },
      coordinates: {
        type: [Number],
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

loadSchema.index({ receiverLocation: "2dsphere" });
loadSchema.index({ shipperLocation: "2dsphere" });

module.exports = mongoose.model("Load", loadSchema);

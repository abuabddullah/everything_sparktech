const mongoose = require('mongoose');

const loadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  shipperName: { type: String, required: true },
  shipperPhoneNumber: { type: String, required: true },
  shipperEmail: { type: String, required: true },

  // changes will be here 
  shippingAddress: { type: String, required: true },

  // load details
  trailerType: { type: String, required: true },
  productType: { type: String, required: true },
  isHazmat: { type: Boolean, default: false },
  Hazmat: { type: String, required: false },
  description: { type: String, required: true },
  shipmentPayment: { type: Number, default: 0 },

  // receiver end
  receiverName: { type: String, required: true },
  receiverPhoneNumber: { type: String, required: true },
  receiverEmail: { type: String, required: true },

  // changes will be here
  receivingAddress: { type: String, required: true },

  palletSpace: { type: Number, default: 0 },
  billOfLading: { type: String, required: true },
  deliveryInstruction: { type: String, required: true },
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Load', loadSchema);
const mongoose = require('mongoose');

const truckDetailSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cdlNumber: { type: String, required: false },
  truckNumber: { type: String, required: false },
  trailerSize: { type: Number, default: 0 },
  palletSpace: { type: Number, default: 0 },
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Truck', truckDetailSchema);
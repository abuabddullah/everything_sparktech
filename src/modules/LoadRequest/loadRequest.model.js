const mongoose = require('mongoose');

const loadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  
  load: { type: mongoose.Schema.Types.ObjectId, ref: 'Load' },
  truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },
  status: { type: String, enum:['Pending', 'Accepted', 'Rejected', 'Delivered'],default: 'Pending' },
}, { 
  timestamps: true 
});

module.exports = mongoose.model('LoadRequest', loadSchema);
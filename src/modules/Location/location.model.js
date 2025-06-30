const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false},
  latitude: { type: Number, required: false },
  longitude: { type: Number, required: false },
  load: { type: mongoose.Schema.Types.ObjectId, ref: 'Load', required: false },
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Location', locationSchema);
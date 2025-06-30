const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment: { type: String, required: false },
  rating: { type: Number, required: true },
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Review', reviewSchema);
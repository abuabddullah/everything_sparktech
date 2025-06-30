const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment: { type: String, required: false },
  rating: { type: Number, required: true },
}, { 
  timestamps: true 
});


module.exports = mongoose.model('Feedback', feedbackSchema);


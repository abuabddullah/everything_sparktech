const mongoose = require('mongoose');

const mySubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiaryDate: { type: Date, required: true },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true }
});

module.exports = mongoose.model('MySubscription', mySubscriptionSchema);
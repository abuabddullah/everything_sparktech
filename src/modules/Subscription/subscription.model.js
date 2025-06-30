const mongoose = require('mongoose');
const { duplexPair } = require('nodemailer/lib/xoauth2');

const subscriptionSchema = new mongoose.Schema({
  name: { type: String, default: '' },price: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  expiaryTime: { type: Number, default: 0 },
  noOfDispathes: { type: Number, default: 0 },
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
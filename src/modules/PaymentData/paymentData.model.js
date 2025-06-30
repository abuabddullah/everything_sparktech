const mongoose = require('mongoose');

const paymentDataSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  amount: { type: Number, required: true },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  subscription: { type: mongoose.SchemaTypes.ObjectId, ref: 'Subscription' },
  paymentType: { type: String, enum: ['Card', 'Paypal', 'Bank'], required: false },
},
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PaymentData', paymentDataSchema);
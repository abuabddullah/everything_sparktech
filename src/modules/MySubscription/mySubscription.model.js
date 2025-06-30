const mongoose = require("mongoose");

const mySubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expiryDate: { type: Date, required: true },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    required: true,
  },
  remainingDispatch: { type: Number, default: 0 },
});

module.exports = mongoose.model("MySubscription", mySubscriptionSchema);

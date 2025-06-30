const ApiError = require('../../helpers/ApiError');
const httpStatus = require('http-status');
const MySubscription = require('./mySubscription.model');
const { getSubscriptionById } = require('../Subscription/subscription.service');

const addMySubscription = async (userId, subsId) => {
  let oldSubs = await getMySubscriptionByNamePriceAndDuration(userId);
  const subscriptionDetails = await getSubscriptionById(subsId);
  if(!subscriptionDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
  }
  if (oldSubs) {
    // set expiry date from today
    oldSubs.expiryDate = new Date(new Date().setMonth(new Date().getMonth() + subscriptionDetails.duration));
    oldSubs.subscription = subsId;
  }
  else{
    oldSubs = new MySubscription({
      user: userId,
      expiryDate: new Date(new Date().setMonth(new Date().getMonth() + subscriptionDetails.duration)),
      subscription: subsId
    });
  }
  return await oldSubs.save();
}

const getMySubscription = async (userId) => {
  return await MySubscription.findOne({ user: userId, expiryDate: { $gte: new Date() } }).populate('subscription');
}
module.exports = {
  addMySubscription,
  getMySubscription
}

const ApiError = require('../../helpers/ApiError');
const httpStatus = require('http-status');
const Subscription = require('./subscription.model');

const addSubscription = async (subscriptionBody) => {
  let oldSubs = await getSubscriptionByNamePriceAndDuration(subscriptionBody);
  if (oldSubs) {
    throw new ApiError(httpStatus.CONFLICT, 'Subscription already exists');
  }
  const newSubs = new Subscription(subscriptionBody);
  return await newSubs.save();
}

const getSubscriptionByNamePriceAndDuration = async (subscriptionBody) => {
  return await Subscription.findOne({ name: subscriptionBody.name, price: subscriptionBody.price, duration: subscriptionBody.duration });
}

const getSubscriptionList = async () => {
  return await Subscription.find();
}

const getSubscriptionById = async (id) => {
  return await Subscription.findById(id);
}

module.exports = {
  addSubscription,
  getSubscriptionList,
  getSubscriptionById
}

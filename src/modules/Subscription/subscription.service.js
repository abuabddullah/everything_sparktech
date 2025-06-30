const ApiError = require("../../helpers/ApiError");
const httpStatus = require("http-status");
const Subscription = require("./subscription.model");

const addSubscription = async (subscriptionBody) => {
  let oldSubs = await getSubscriptionByNamePriceAndDuration(subscriptionBody);
  if (oldSubs) {
    throw new ApiError(httpStatus.CONFLICT, "Subscription already exists");
  }
  const newSubs = new Subscription(subscriptionBody);
  return await newSubs.save();
};

const updateSubscriptionById = async(id, subscriptionBody) => {
  let oldSubs = await getSubscriptionById(id);
  if (!oldSubs) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
  }
  return await Subscription.findByIdAndUpdate(id, subscriptionBody, { new: true });
}



const getSubscriptionByNamePriceAndDuration = async (subscriptionBody) => {
  return await Subscription.findOne({
    $and: [
      { name: subscriptionBody.name },
      { price: subscriptionBody.price },
      { duration: subscriptionBody.duration },
      { createdFor: subscriptionBody.createdFor },
    ],
  });
};

const getSubscriptionForUser = async () => {
  const userSub = await Subscription.find({ createdFor: "user" });
  return userSub;
};

const getSubscriptionForDriver = async () => {
  return await Subscription.find({ createdFor: "driver" });
};

const getSubscriptionList = async () => {
  return await Subscription.find();
};

const getSubscriptionById = async (id) => {
  return await Subscription.findById(id);
};

const deleteSubscriptionById = async (id) => {
  console.log("delete subs ->> ", id);
  return await Subscription.findByIdAndDelete(id);
};

module.exports = {
  addSubscription,
  updateSubscriptionById,
  getSubscriptionList,
  getSubscriptionById,
  getSubscriptionForUser,
  getSubscriptionForDriver,
  deleteSubscriptionById
};

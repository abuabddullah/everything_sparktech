const ApiError = require("../../helpers/ApiError");
const httpStatus = require("http-status");
const MySubscription = require("./mySubscription.model");
const { getSubscriptionById } = require("../Subscription/subscription.service");
const paymentDataModel = require("../PaymentData/paymentData.model");

// const addMySubscription = async (userId, subsId) => {
//   let oldSubs = await getMySubscription(userId);
//   const subscriptionDetails = await getSubscriptionById(subsId);
//   if(!subscriptionDetails) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
//   }
//   if (oldSubs) {
//     // set expiry date from today
//     oldSubs.expiryDate = new Date(new Date().setMonth(new Date().getMonth() + subscriptionDetails.duration));
//     oldSubs.subscription = subsId;
//     oldSubs.remainingDispatch += subscriptionDetails.noOfDispathes;
//   }
//   else{
//     oldSubs = new MySubscription({
//       user: userId,
//       expiryDate: new Date(new Date().setMonth(new Date().getMonth() + subscriptionDetails.duration)),
//       subscription: subsId,
//       remainingDispatch : subscriptionDetails.noOfDispathes
//     });
//   }
//   return await oldSubs.save();
// }

const addMySubscription = async (userId, subsId, paymentDetails) => {
  const subscription = await getSubscriptionById(subsId);
  if (!subscription) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subscription not found");
  }

  // Record payment
  const payment = new paymentDataModel({
    paymentId: paymentDetails.paymentId,
    amount: subscription.price,
    user: userId,
    subscription: subsId,
    paymentType: paymentDetails.paymentType,
  });
  await payment.save();

  // Update or create MySubscription
  let userSubscription = await getMySubscription(userId, subsId);

  if (userSubscription) {
    userSubscription.expiryDate = new Date(
      new Date().setMonth(new Date().getMonth() + subscription.duration)
    );
    userSubscription.remainingDispatch += subscription.noOfDispathes;
  } else {
    userSubscription = new MySubscription({
      user: userId,
      subscription: subsId,
      expiryDate: new Date(
        new Date().setMonth(new Date().getMonth() + subscription.duration)
      ),
      remainingDispatch: subscription.noOfDispathes,
    });
  }

  await userSubscription.save();

  return { payment, subscription: userSubscription };
};

const getMySubscriptionDetail = async (userId) => {
  return await MySubscription.findOne({
    user: userId,
    expiryDate: { $gte: new Date() },
  }).populate("subscription");
};

const getMySubscription = async (userId, subsId) => {
  return await MySubscription.findOne({
    user: userId,
    subscription: subsId,
    expiryDate: { $gte: new Date() },
  }).populate("subscription");
};

module.exports = {
  //addMySubscription,
  getMySubscription,
  addMySubscription,
  getMySubscriptionDetail,
};

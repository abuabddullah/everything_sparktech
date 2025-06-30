const httpStatus = require("http-status");
const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const { findPaymentData } = require("../PaymentData/paymentData.service");
const {
  getMySubscription,
  addMySubscription,
  getMySubscriptionDetail,
} = require("./mySubscription.service");
const { getSubscriptionById } = require("../Subscription/subscription.service");
const { getUserById } = require("../User/user.service");
const MySubscription = require("./mySubscription.model");

const getMySubscriptionDetails = catchAsync(async (req, res) => {
  const subsList = await getMySubscriptionDetail(req.User._id);
  return res
    .status(httpStatus.OK)
    .json(
      response({
        statusCode: httpStatus.OK,
        message: "subscription-fetched",
        data: subsList,
        status: "OK",
      })
    );
});

const purchasedSubscription = catchAsync(async (req, res) => {
  const paymentDetails = req.body;
  const userId = req.User._id;
  const subsId = req.params.subsId;
  const subscription = await getSubscriptionById(subsId);
  if (!subscription) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json(
        response({
          statusCode: httpStatus.BAD_REQUEST,
          message: "BAD REQUEST",
          status: "PAYMENT_REQUIRED",
        })
      );
  }
  const paymentDataBody = { userId, paymentDetails };

  const Invalidpayment = await findPaymentData(paymentDataBody);
  if (Invalidpayment) {
    return res
      .status(httpStatus.PAYMENT_REQUIRED)
      .json(
        response({
          statusCode: httpStatus.PAYMENT_REQUIRED,
          message: req.t("your paymentId used for another purpose"),
          status: "PAYMENT_REQUIRED",
        })
      );
  } else {
    const subsList = await addMySubscription(userId, subsId, paymentDetails);
    const user = await getUserById(userId);

    user.remainingDispatch = subsList.subscription.remainingDispatch;
    user.save();
    return res
      .status(httpStatus.OK)
      .json(
        response({
          statusCode: httpStatus.OK,
          message: "purchase subscription successfull",
          data: subsList,
          status: "ok",
        })
      );
  }
});

const deductSubscriptionBalance = async (user, deductionAmount) => {
  if (!user) {
    throw new Error("User not found");
  }
  if (user.remainingDispatch < deductionAmount) {
    throw new Error("Insufficient subscription balance");
  }
  user.remainingDispatch -= deductionAmount;
  await user.save();

  return user.remainingDispatch;
};

// have to solve issue
const myPackages = catchAsync(async (req, res) => {
  const subsList = await MySubscription.find({
    user: req.User._id,
  }).populate("subscription");
  return res
    .status(httpStatus.OK)
    .json(
      response({
        statusCode: httpStatus.OK,
        message: "subscription-fetched",
        data: subsList,
        status: "OK",
      })
    );
});

module.exports = {
  getMySubscriptionDetails,
  purchasedSubscription,
  deductSubscriptionBalance,
  myPackages,
};

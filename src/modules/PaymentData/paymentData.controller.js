const response = require("../../helpers/response");
const catchAsync = require("../../helpers/catchAsync");
const {
  addPaymentData,
  getPaymentLists,
  getEarningChart,
  createPayment,
  confirmPayment,
  totalEarningService,
  todaysEarningService,
} = require("./paymentData.service");
const {
  addMySubscription,
} = require("../MySubscription/mySubscription.service");
const httpStatus = require("http-status");
const subscriptionModel = require("../Subscription/subscription.model");

const isExistSubscription = async (subcriptionId) => {
  const data = await subscriptionModel.findById(subcriptionId);
  return data;
};

const addNewPaymentData = catchAsync(async (req, res) => {
  req.body.user = req.User._id;
  const paymentAc = await addPaymentData(req.body);
  // await addMySubscription(req.User._id, req.body.subscription);
  return res.status(200).json(
    response({
      status: "Success",
      statusCode: "200",
      type: "payment",
      message: req.t("payment-listed"),
      data: paymentAc,
    })
  );
});

const allPaymentList = catchAsync(async (req, res) => {
  const filter = {};
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
  };
  // if (req.User.role === 'ootms') {
  //   filter.ootms = req.User._id;
  // }
  if (req.User.role !== "admin") {
    return res.status(httpStatus.UNAUTHORIZED).json(
      response({
        status: "UNAUTHORIZED",
        statusCode: httpStatus.UNAUTHORIZED,
        type: "payment",
        message: "you are UNAUTHORIZED",
      })
    );
  }
  const paymentResult = await getPaymentLists(filter, options);
  return res.status(200).json(
    response({
      status: "Success",
      statusCode: "200",
      type: "payment",
      message: req.t("payment-list"),
      data: paymentResult,
    })
  );
});

const getPaymentChart = catchAsync(async (req, res) => {
  const year = Number(req.query.year || new Date().getFullYear());
  const paymentResult = await getEarningChart(year);
  return res.status(200).json(
    response({
      status: "Success",
      statusCode: "200",
      type: "payment",
      message: req.t("payment-list"),
      data: paymentResult,
    })
  );
});

const createPaymentss = catchAsync(async (req, res) => {
  const { _id, role } = req.User;

  if (role === "admin") {
    throw new Error("Admins are not allowed to create payments.");
  }

  req.body._id = _id;
  const { _id: userId, subcriptionId, amount } = req.body;

  // Check for required fields
  if (!userId || !subcriptionId || !amount) {
    throw new Error(
      "Invalid request body. userId, subcriptionId, and amount are required."
    );
  }

  // Check if subscription exists
  const isExist = await isExistSubscription(subcriptionId); // Ensure the function is awaited
  if (!isExist) {
    throw new Error(`Subscription with ID ${subcriptionId} does not exist.`);
  }

  // Check if role is 'user' and createdFor is 'driver'
  if (role === "user" && isExist.createdFor === "driver") {
    throw new Error(
      "Users are not allowed to create payments for driver subscriptions."
    );
  }

  // Check if role is 'driver' and createdFor is 'user'
  if (role === "driver" && isExist.createdFor === "user") {
    throw new Error(
      "Driver are not allowed to create payments for user subscriptions."
    );
  }

  req.body.subscriptionData = isExist;

  const paymentResult = await createPayment(req.body);

  return res.status(200).json(
    response({
      status: "Success",
      statusCode: "200",
      type: "payment",
      message: req.t("payment-list"),
      data: paymentResult,
    })
  );
});

const confirmPaymentss = catchAsync(async (req, res) => {
  const userAgent = req.headers["user-agent"];
  console.log("User-Agent:", userAgent);

  // Check if the request is from a mobile device
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);

  const deviceType = isMobile ? "Mobile" : "PC";

  const data = {
    userId: req.query.userId,
    subcriptionId: req.query.subcriptionId,
    amount: req.query.amount,
    duration: req.query.duration,
    noOfDispatches: req.query.noOfDispatches,
  };

  const paymentResult = await confirmPayment(data);

  console.log({paymentResult}, "paymentResult");

  if (paymentResult) {
    const subscription = await subscriptionModel.findOne({
      _id: paymentResult.subscription,
    });

    if (deviceType !== "Mobile") {
      res.redirect(
        `https://ootms.com/payment-success?amount=${paymentResult.amount}&duration=${subscription.duration}&noOfDispatches=${subscription.noOfDispatches}&subcriptionName=${subscription.name}&subcriptionId=${subscription._id}`
      );
    }
  }
  return res.status(200).json(
    response({
      status: "Success",
      statusCode: "200",
      type: "payment",
      message: req.t("thank you for payment"),
      // data: paymentResult,
    })
  );
});

const confirmPaymentssInApp = catchAsync(async (req, res) => {
  const data = {
    userId: req.User._id,
    subcriptionId: req.body.subcriptionId,
    amount: req.body.amount,
    duration: req.body.duration,
    noOfDispatches: req.body.noOfDispatches,
    paymentIntentId: req.body.paymentId,
  };
  const paymentResult = await confirmPayment(data);
  return res.status(200).json(
    response({
      status: "Success",
      statusCode: "200",
      type: "payment",
      message: req.t("thank you for payment"),
      data: paymentResult,
    })
  );
});

const totalEarning = catchAsync(async (req, res) => {
  const data = await totalEarningService();
  return res.status(200).json(
    response({
      status: "Success",
      statusCode: "200",
      type: "payment",
      message: req.t("payment-list"),
      data: data,
    })
  );
});

const todaysEarning = catchAsync(async (req, res) => {
  const data = await todaysEarningService();
  return res.status(200).json(
    response({
      status: "Success",
      statusCode: "200",
      type: "payment",
      message: req.t("payment-list"),
      data: data,
    })
  );
});

module.exports = {
  addNewPaymentData,
  allPaymentList,
  allPaymentList,
  getPaymentChart,
  createPaymentss,
  confirmPaymentss,
  confirmPaymentssInApp,
  totalEarning,
  todaysEarning,
};

const httpStatus = require("http-status");
const ApiError = require("../../helpers/ApiError");
const PaymentData = require("./paymentData.model");

const crypto = require("crypto");
const mySubscriptionModel = require("../MySubscription/mySubscription.model");
const { createCheckoutSession } = require("./paymentData.utils");

const addPaymentData = async (paymentDataBody) => {
  var paymentData = await findPaymentData(paymentDataBody);
  if (paymentData) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "this payment-information already exists..."
    );
  }

  return "payment data checking...";
  // paymentData = new PaymentData(paymentDataBody);
  // await paymentData.save();
  // return paymentData;
};

const findPaymentData = async (paymentDataBody) => {
  const paymentData = await PaymentData.findOne({
    $and: {
      user: paymentDataBody.userId,
      paymentId: paymentDataBody.paymentId,
    },
  });
  return paymentData;
};

const getPaymentLists = async (filter, options) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const payment = await PaymentData.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" }, // Sum up the amount field from paymentData
      },
    },
  ]);
  const todayStart = new Date(new Date().setHours(0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59));

  const todayIncomes = await PaymentData.aggregate([
    {
      $match: {
        createdAt: {
          $gte: todayStart,
          $lt: todayEnd,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const paymentList = await PaymentData.find(filter)
    .skip(skip)
    .limit(limit)
    .populate("user", "fullName userId email phoneNumber image")
    .sort({ createdAt: -1 });
  //const paymentList = await PaymentData.find(filter).skip(skip).limit(limit).populate('user', 'fullName email phoneNumber image').populate('appointment').populate('ootms', 'fullName email phoneNumber image').sort({ createdAt: -1 });

  // Get total results count without pagination
  const totalResults = await PaymentData.countDocuments(filter);

  // Calculate total pages
  const totalPages = Math.ceil(totalResults / limit);

  // Pagination info
  const pagination = { totalResults, totalPages, currentPage: page, limit };

  return {
    paymentList,
    todayIncome: todayIncomes.length ? todayIncomes[0].totalAmount : 0,
    totalAmount: payment.length ? payment[0].totalAmount : 0,
    pagination,
  };
};

const getEarningChart = async (year) => {
  const nextYear = year + 1;
  const yearStartDate = new Date(year, 0, 1);
  const yearEndDate = new Date(nextYear, 0, 1);
  const allPayments = await PaymentData.find({
    createdAt: { $gte: yearStartDate, $lt: yearEndDate },
    status: "success",
  });

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyCounts = monthNames.map((month, index) => ({
    name: month,
    amount: 0,
  }));

  allPayments.forEach((payment) => {
    const createdAt = new Date(payment.createdAt);
    const monthIndex = createdAt.getMonth();
    const monthCount = monthlyCounts[monthIndex];
    monthCount.amount += payment.amount;
  });

  return monthlyCounts;
};

//
const createPayment = async (payload) => {
  const result = await createCheckoutSession(payload);
  return result;
};

const confirmPayment = async (data) => {
  const {
    userId,
    subcriptionId,
    amount,
    duration,
    noOfDispatches,
    paymentIntentId,
  } = data;

  // Default `noOfDispatches` to 0 if undefined
  const dispatchesToAdd = isNaN(Number(noOfDispatches))
    ? 0
    : Number(noOfDispatches);
  // Generate a random ID of 16 bytes, converted to hexadecimal
  const paymentId = `pi_${crypto.randomBytes(16).toString("hex")}`;

  const paymentDataBody = {
    paymentId: paymentIntentId ? paymentIntentId : paymentId,
    amount,
    subscription: subcriptionId,
    user: userId,
    paymentType: "Card",
  };

  let paymentData;

  try {
    // Save payment data
    paymentData = new PaymentData(paymentDataBody);

    await paymentData.save();

    // // Set the expiry date (today's date + duration) in YYYY-MM-DD format

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight
    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + Number(duration));

    // // Extract date in YYYY-MM-DD format
    const formattedExpiryDate = expiryDate.toISOString().split("T")[0];

    // // Check if the user already has a subscription in MySubscription
    const existingSubscription =
      (await mySubscriptionModel.findOne({ user: userId })) ?? false;

    const currentRemainingDispatch =
      existingSubscription.remainingDispatch ?? 0;

    if (existingSubscription) {
      // Update the existing subscription
      existingSubscription.subscription = subcriptionId;
      existingSubscription.expiryDate = formattedExpiryDate;
      existingSubscription.remainingDispatch =
        currentRemainingDispatch + dispatchesToAdd;
      await existingSubscription.save();
    } else {
      // Create a new subscription
      const newSubscription = new mySubscriptionModel({
        user: userId,
        subscription: subcriptionId,
        expiryDate: formattedExpiryDate,
        remainingDispatch: dispatchesToAdd,
      });

      await newSubscription.save();
    }
  } catch (error) {
    console.error("Error in confirmPayment:", error);
    throw new Error("Failed to process the payment and subscription.");
  }

  return paymentData;
};

const totalEarningService = async () => {
  const payment = await PaymentData.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" }, // Sum up the amount field from paymentData
      },
    },
  ]);
  return payment.length ? payment[0].totalAmount : 0;
};

const todaysEarningService = async () => {
  const todayStart = new Date(new Date().setHours(0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59));
  const todayIncomes = await PaymentData.aggregate([
    {
      $match: {
        createdAt: {
          $gte: todayStart,
          $lt: todayEnd,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);
  return todayIncomes.length ? todayIncomes[0].totalAmount : 0;
};

module.exports = {
  addPaymentData,
  getPaymentLists,
  getEarningChart,
  findPaymentData,
  createPayment,
  confirmPayment,
  totalEarningService,
  todaysEarningService,
};

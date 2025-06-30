const httpStatus = require('http-status');
const ApiError = require('../../helpers/ApiError');
const PaymentData = require('./paymentData.model');

const addPaymentData = async (paymentDataBody) => {
  var paymentData = await findPaymentData(paymentDataBody);
  if (paymentData) {
    throw new ApiError(httpStatus.CONFLICT, 'payment-exists');
  }
  paymentData = new PaymentData(paymentDataBody);
  await paymentData.save();
  return paymentData;
}

const findPaymentData = async (paymentDataBody) => {
  const paymentData = await PaymentData.findOne({ user: paymentDataBody.user, paymentId: paymentDataBody.paymentId });
  return paymentData;
}

const getPaymentLists = async (filter, options) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const payment = await PaymentData.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' } // Sum up the amount field from paymentData
      }
    }
  ]);
  const todayStart = new Date(new Date().setHours(0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59));

  const todayIncomes = await PaymentData.aggregate([
    {
      $match: {
        createdAt: {
          $gte: todayStart,
          $lt: todayEnd
        }
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const paymentList = await PaymentData.find(filter).skip(skip).limit(limit).populate('user', 'fullName email phoneNumber image').populate('appointment').populate('ootms', 'fullName email phoneNumber image').sort({ createdAt: -1 });

  // Get total results count without pagination
  const totalResults = await PaymentData.countDocuments(filter);

  // Calculate total pages
  const totalPages = Math.ceil(totalResults / limit);

  // Pagination info
  const pagination = { totalResults, totalPages, currentPage: page, limit };

  return { paymentList, todayIncome: todayIncomes.length ? todayIncomes[0].totalAmount : 0, totalAmount: payment.length ? payment[0].totalAmount : 0, pagination };
};

const getEarningChart = async (year) => {
  const nextYear = year + 1;
  const yearStartDate = new Date(year, 0, 1);
  const yearEndDate = new Date(nextYear, 0, 1);
  const allPayments = await PaymentData.find({
    createdAt: { $gte: yearStartDate, $lt: yearEndDate },
    status: "success"
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
}

module.exports = {
  addPaymentData,
  getPaymentLists,
  getEarningChart
}

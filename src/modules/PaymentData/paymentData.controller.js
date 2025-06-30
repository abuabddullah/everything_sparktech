const response = require("../../helpers/response");
const catchAsync = require('../../helpers/catchAsync');
const { addPaymentData, getPaymentLists, getEarningChart } = require("./paymentData.service");
const { addMySubscription } = require("../MySubscription/mySubscription.service");

const addNewPaymentData = catchAsync(
  async (req, res) => {
    req.body.user = req.User._id;
    const paymentAc = await addPaymentData(req.body);
    await addMySubscription(req.User._id, req.body.subscription);
    return res.status(200).json(response({ status: 'Success', statusCode: '200', type: 'payment', message: req.t('payment-listed'), data: paymentAc }));
  }
)

const allPaymentList = catchAsync(async (req, res) => {
  const filter = {}
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10
  };
  if (req.User.role === 'ootms') {
    filter.ootms = req.User._id;
  }
  const paymentResult = await getPaymentLists(filter, options);
  return res.status(200).json(response({ status: 'Success', statusCode: '200', type: 'payment', message: req.t('payment-list'), data: paymentResult }));
})

const getPaymentChart = catchAsync(async (req, res) => {
  const year = Number(req.query.year || new Date().getFullYear());
  const paymentResult = await getEarningChart(year);
  return res.status(200).json(response({ status: 'Success', statusCode: '200', type: 'payment', message: req.t('payment-list'), data: paymentResult }));
})

module.exports = { addNewPaymentData, allPaymentList, allPaymentList, getPaymentChart }
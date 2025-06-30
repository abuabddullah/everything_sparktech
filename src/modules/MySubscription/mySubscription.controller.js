const catchAsync = require('../../helpers/catchAsync')
const response = require("../../helpers/response");
const { getMySubscription } = require('./mySubscription.service');

const getMySubscriptionDetails = catchAsync(async (req, res) => {
  const subsList = await getMySubscription(req.User._id);
  return res.status(200).json(response({ statusCode: '200', message: req.t('subscription-fetched'), data: subsList, status: "OK" }));
})

module.exports = { getMySubscriptionDetails }
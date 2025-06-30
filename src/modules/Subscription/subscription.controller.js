const catchAsync = require('../../helpers/catchAsync')
const response = require("../../helpers/response");
const { addSubscription, getSubscriptionList } = require('./subscription.service');

const addNewSubscription = catchAsync(async (req, res) => {
  if(req.User.role !== 'admin') {
    return res.status(403).json(response({ statusCode: '401', message: req.t('unauthorized'), status: "ERROR" }));
  }
  const newSubscription = await addSubscription(req.body);
  return res.status(200).json(response({ statusCode: '200', message: req.t('subscription-added'), data: newSubscription, status: "OK" }));
})

const getAllSubscription = catchAsync(async (req, res) => {
  const subsList = await getSubscriptionList();
  return res.status(200).json(response({ statusCode: '200', message: req.t('subscription-fetched'), data: subsList, status: "OK" }));
})

module.exports = { addNewSubscription, getAllSubscription }
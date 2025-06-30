const catchAsync = require('../../helpers/catchAsync')
const response = require("../../helpers/response");
const { addFeedback, getFeedbacks } = require('./feedback.service');

const addNewFeedback = catchAsync(async (req, res) => {
  req.body.user = req.User._id;
  const feedbacktatus = await addFeedback(req.body);
  return res.status(201).json(response({ status: 'OK', statusCode: '201', type: 'feedback', message: req.t('feedback-added'), data: feedbacktatus }));
});

const getFeedbacksList = catchAsync(async (req, res) => {
  let filter = {};
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10
  }
  const feedbackList = await getFeedbacks(filter, options);
  return res.status(200).json(response({ status: 'OK', statusCode: '200', type: 'feedback', message: req.t('feedback-list'), data: feedbackList }));
});

module.exports = { addNewFeedback, getFeedbacksList }
const catchAsync = require('../../helpers/catchAsync')
const response = require("../../helpers/response");
const { addReview, getReviews, avgReview } = require('./review.service');

const addNewReview = catchAsync(async (req, res) => {
  req.body.user = req.User._id;
  const reviewtatus = await addReview(req.body);
  return res.status(201).json(response({ status: 'OK', statusCode: '201', type: 'review', message: req.t('review-added'), data: reviewtatus }));
});

const getAllReviews = catchAsync(async (req, res) => {
  const filter = {
    ootms: req.params.id
  };
  const reviewList = await avgReview(filter);
  return res.status(200).json(response({ status: 'OK', statusCode: '200', type: 'review', message: req.t('review-list'), data: reviewList }));
});

const getReviewsList = catchAsync(async (req, res) => {
  const filter = {
    ootms: req.params.id
  };
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10
  }
  const reviewList = await getReviews(filter, options);
  return res.status(200).json(response({ status: 'OK', statusCode: '200', type: 'review', message: req.t('review-list'), data: reviewList }));
});

module.exports = { addNewReview, getAllReviews, getReviewsList }
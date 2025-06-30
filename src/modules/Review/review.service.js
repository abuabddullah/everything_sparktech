const httpStatus = require('http-status');
const ApiError = require('../../helpers/ApiError');
const { getUserById } = require('../User/user.service');
const Review = require('./review.model');

async function  getAverageReviews(filters){
  const totalReviews = await Review.countDocuments(filters);
  const fiveStarReviews = await Review.countDocuments({...filters, rating: 5});
  const fourStarReviews = await Review.countDocuments({...filters, rating: 4});
  const threeStarReviews = await Review.countDocuments({...filters, rating: 3});
  const twoStarReviews = await Review.countDocuments({...filters, rating: 2});
  const oneStarReviews = await Review.countDocuments({...filters, rating: 1});
  const averageRatings = (((fiveStarReviews * 5 + fourStarReviews * 4 + threeStarReviews * 3 + twoStarReviews * 2 + oneStarReviews) / totalReviews)||0).toFixed(2);

  return {
    averageRatings, totalReviews, fiveStarReviews, fourStarReviews, threeStarReviews, twoStarReviews, oneStarReviews
  }
}

const addReview = async (reviewBody) => {
  var existingReview = await findReviewsByUsers(reviewBody);
  const driverDetails = await getUserById(reviewBody.ootms);
  const dispatchCompleted = driverDetails.dispatchCompleted>0?driverDetails.dispatchCompleted:1;
  if(!driverDetails){
    throw new ApiError(httpStatus.NOT_FOUND, 'ootms-not-found');
  }
  if (!existingReview) {
    existingReview = new Review(reviewBody);
    driverDetails.ratings = ((driverDetails.ratings + reviewBody.rating) / (dispatchCompleted + 1));
  }
  else {
    driverDetails.ratings = ((driverDetails.ratings - existingReview.rating + reviewBody.rating) / dispatchCompleted);
    existingReview.comment = reviewBody.comment;
    existingReview.rating = reviewBody.rating;
  }
  driverDetails.save();
  return await existingReview.save();
}

const findReviewsByUsers = async (reviewBody) => {
  return await Review.findOne({ user: reviewBody.user, ootms: reviewBody.ootms });
}

const avgReview = async (filter) => {
  return await getAverageReviews(filter);
}

const getReviews = async (filter, options) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const reviewsList = await Review.find(filter)
    .sort({ rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'fullName image');

  // Get total count for pagination
  const totalResults = await Review.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);
  const pagination = { totalResults, totalPages, currentPage: page, limit };

  const { averageRatings, totalReviews, fiveStarReviews, fourStarReviews, threeStarReviews, twoStarReviews, oneStarReviews } = await getAverageReviews();
  const reviewCounts = await Review.countDocuments({ comment: { $ne: null } });

  const reviewSection = { averageRatings, reviewCounts, ratingCounts: totalReviews, fiveStarReviews, fourStarReviews, threeStarReviews, twoStarReviews, oneStarReviews }
  return { reviewsList, pagination, reviewSection };
};

const getReviewByootmsId = async (ootmsId) => {
  return await Review.find({ ootms: ootmsId });
}

const getTopReviewOfootms = async (ootmsId) => {
  const ratings = await getAverageReviews({ ootms: ootmsId });
  const topReview = await Review.findOne({ ootms: ootmsId }).sort({ rating: -1 }).populate('user', 'fullName image');
  return { ratings, topReview };
}

module.exports = {
  addReview,
  getReviews,
  getAverageReviews,
  getTopReviewOfootms,
  getReviewByootmsId,
  avgReview
}

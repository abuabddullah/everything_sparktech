const Feedback = require('./feedback.model');

const addFeedback = async (feedbackBody) => {
  const userFeedback = new Feedback(feedbackBody);
  return await userFeedback.save();
}

const getFeedbacks = async (filter, options) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const feedbacksList = await Feedback.find(filter)
    .sort({ rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'fullName image');

  const totalResults = await Feedback.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);
  const pagination = { page, limit, totalResults, totalPages };

  return { feedbacksList, pagination };
};

module.exports = {
  addFeedback,
  getFeedbacks
}

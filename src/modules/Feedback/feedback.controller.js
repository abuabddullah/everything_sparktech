const httpStatus = require("http-status");
const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const { getUserById } = require("../User/user.service");
const {
  addFeedback,
  getFeedbacks,
  addAppFeedback,
  getDetailsWithReviews,
  getAllWithAvgRatings,
  deleteFeedbackService,
} = require("./feedback.service");

//user
const addNewUserFeedback = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = { ...req.body, appService: false };
  if (req.User.role === "driver") {
    data.user = id;
    data.driver = req.User._id;
  } else if (req.User.role === "user") {
    data.user = req.User._id;
    data.driver = id;
  }
  const feedback = await addFeedback(data, req.User);
  return res
    .status(201)
    .json(
      response({
        status: "OK",
        statusCode: "201",
        type: "feedback",
        message: req.t("feedback-added"),
        data: feedback,
      })
    );
});

//app
const feedbackForApp = catchAsync(async (req, res) => {
  const data = { ...req.body, appService: true, user: req.User._id };
  const feedback = await addAppFeedback(data);
  if (feedback) {
    return res
      .status(httpStatus.CREATED)
      .json(
        response({
          status: "CREATED",
          statusCode: httpStatus.CREATED,
          type: "feedback",
          message: req.t("feedback-added"),
          data: feedback,
        })
      );
  } else {
    return res
      .status(httpStatus.FORBIDDEN)
      .json(
        response({
          status: "forbiden",
          statusCode: httpStatus.FORBIDDEN,
          type: "feedback",
          message: req.t("failed to add feedback"),
        })
      );
  }
});

const getFeedbacksList = catchAsync(async (req, res) => {
  let filter = { appService: true };
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
  };

  const feedbackList = await getFeedbacks(filter, options);

  console.log(feedbackList);
  return res
      .status(httpStatus.OK)
      .json(
        response({
          status: "OK",
          statusCode: httpStatus.OK,
          type: "feedback",
          message: req.t("feedback-list"),
          data: feedbackList,
        })
      );
});

//My Code
const driverAvgReview = catchAsync(async (req, res) => {
  const drivers = await getAllWithAvgRatings("driver");
  return res.status(200).json(drivers);
});

const userAvgReview = catchAsync(async (req, res) => {
  const users = await getAllWithAvgRatings("user");
  return res.status(200).json(users);
});

// Fetch details of a user or driver with reviews
const specificUserInfo = async (req, res) => {
  try {
    const { id } = req.params;
    var user = await getUserById(id);
    const role = user.role;
    const details = await getDetailsWithReviews(id, role);
    return res.status(200).json(details);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteFeedbackController = async (req, res) => {
  const { id } = req.params;
  await deleteFeedbackService(id);
  return res.status(204).json({ message: "Feedback deleted successfully" });
};

module.exports = {
  addNewUserFeedback,
  feedbackForApp,
  getFeedbacksList,
  userAvgReview,
  driverAvgReview,
  specificUserInfo,
  deleteFeedbackController,
};
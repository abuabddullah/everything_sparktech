const Feedback = require("./feedback.model");
const User = require("../User/user.model");
const { default: mongoose, Types } = require("mongoose");
const { addNotification } = require("../Notification/notification.service");

const addAppFeedback = async (data) => {
  return await Feedback.create(data);
};

const addFeedback = async (feedbackBody, user) => {
  const addReviewUserId =
    user.role === "driver" ? feedbackBody.user : feedbackBody.driver;
  const currentAverageRating = await Feedback.aggregate([
    {
      $match: {
        [user.role === "user" ? "driver" : "user"]: new mongoose.Types.ObjectId(
          String(addReviewUserId)
        ),
      },
    },
    {
      $group: {
        _id: addReviewUserId,
        avgRating: { $avg: "$rating" }, // Current average rating
        totalReviews: { $count: {} }, // Total reviews so far
      },
    },
    {
      $project: {
        _id: 0,
        averageRating: { $round: ["$avgRating", 1] }, // Rounded average rating
        totalReviews: 1,
      },
    },
  ]);

  // Extract current average rating and total reviews
  const currentAvgRating = currentAverageRating[0]?.averageRating || 0;
  const currentTotalReviews = currentAverageRating[0]?.totalReviews || 0;

  // Add the new feedback rating to calculate the new average rating
  const newRating = feedbackBody.rating;
  const updatedTotalReviews = currentTotalReviews + 1;
  // Calculate new average rating
  const updatedAverageRating =
    (currentAvgRating * currentTotalReviews + newRating) / updatedTotalReviews;
  const fixingAvgRating = updatedAverageRating.toFixed(1);

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await Feedback.create([feedbackBody], { session });

    if (result[0]?._id) {
      const user = await User.findByIdAndUpdate(
        addReviewUserId,
        { $set: { ratings: fixingAvgRating } },
        { new: true, session }
      );
    }

    console.log({ result: result[0] });

    const notificationData = {
      message: "New feedback added successfully",
      type: "feedback",
      role: user.role,
      linkId: result[0]?._id,
      sender: user._id,
      receiver: user.role === "driver" ? result[0]?.user : result[0]?.driver,
    };

    console.log({ notificationData });

    await addNotification(notificationData);

    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getFeedbacks = async (filter, options) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const feedbacksList = await Feedback.find(filter)
    .sort({ rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("user", "fullName image email role");

  const totalResults = await Feedback.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);
  const pagination = { page, limit, totalResults, totalPages };

  return { feedbacksList, pagination };
};

// Fetch all users or drivers with average ratings
const getAllWithAvgRatings = async (role) => {
  try {
    const matchField = role === "driver" ? "driver" : "user";

    const avgRatings = await Feedback.aggregate([
      {
        $match: { [matchField]: { $ne: null }, appService: false },
      },
      {
        $group: {
          _id: `$${matchField}`,
          avgRating: { $avg: "$rating" },
          totalReviews: { $count: {} },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 0,
          id: "$userDetails._id",
          fullName: "$userDetails.fullName",
          phoneNumber: "$userDetails.phoneNumber",
          email: "$userDetails.email",
          role: "$userDetails.role",
          avgRating: 1,
          totalReviews: 1,
        },
      },
      {
        $match: { role },
      },
    ]);

    return avgRatings;
  } catch (error) {
    throw new Error(
      `Failed to fetch ${role}s with average ratings: ${error.message}`
    );
  }
};

const getDetailsWithReviews = async (userId, role) => {
  try {
    const feedbacks = await Feedback.aggregate([
      {
        $match: { driver: new mongoose.Types.ObjectId(String(userId)) },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "reviewer",
        },
      },
      {
        $unwind: "$reviewer",
      },
      {
        $project: {
          rating: 1,
          comment: 1,
          appService: 1,
          createdAt: 1,
          reviewer: {
            _id: 1,
            fullName: 1,
            email: 1,
            phoneNumber: 1,
            image: 1,
          },
        },
      },
      {
        $match: {
          rating: { $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          reviews: { $push: "$$ROOT" },
          averageRating: { $avg: "$rating" },
        },
      },
      {
        $project: {
          _id: 0,
          reviews: 1,
          averageRating: { $round: ["$averageRating", 1] },
        },
      },
    ]);

    // Fetch the main user details
    const user = await User.findById(userId).select(
      "fullName email phoneNumber updatedAt"
    );

    return {
      user,
      averageRating: feedbacks[0]?.averageRating || 0,
      reviews: feedbacks[0]?.reviews || [],
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch details for user ${userId}: ${error.message}`
    );
  }
};

const deleteFeedbackService = async (feedbackId) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(feedbackId);
    if (!feedback) {
      throw new Error("Feedback not found");
    }
    return feedback;
  } catch (error) {
    throw new Error(`Failed to delete feedback: ${error.message}`);
  }
};

module.exports = {
  addAppFeedback,
  addFeedback,
  getFeedbacks,
  getAllWithAvgRatings,
  getDetailsWithReviews,
  deleteFeedbackService,
};

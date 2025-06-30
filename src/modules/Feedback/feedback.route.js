const express = require("express");
const {
  feedbackForApp,
  getFeedbacksList,
  specificUserInfo,
  driverAvgReview,
  userAvgReview,
  addNewUserFeedback,
  deleteFeedbackController,
} = require("./feedback.controller");
const router = express.Router();

const { isValidUser } = require("../../middlewares/auth");

//follow routes
router.post("/:id", isValidUser, addNewUserFeedback);
router.post("/", isValidUser, feedbackForApp);
router.get("/", getFeedbacksList);
router.get("/admin/users", isValidUser, userAvgReview);
router.get("/admin/drivers", isValidUser, driverAvgReview);
router.get("/admin/details/:id", isValidUser, specificUserInfo);

router.delete("/:id", isValidUser, deleteFeedbackController);

module.exports = router;

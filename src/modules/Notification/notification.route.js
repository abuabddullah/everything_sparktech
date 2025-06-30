const express = require("express");
const {
  getAllNotifications,
  markNotificationAsRead,
  getNotificationDetails,
  getAllMyNotifications,
  createNotification,
} = require("./notification.controller");
const router = express.Router();
const { isValidUser } = require("../../middlewares/auth");

router.get("/", isValidUser, getAllNotifications);
router.get("/my_notification", isValidUser, getAllMyNotifications);
router.post("/create_notification", isValidUser, createNotification);

router.get("/:id", isValidUser, getNotificationDetails);
router.put("/read/:id", markNotificationAsRead);

module.exports = router;

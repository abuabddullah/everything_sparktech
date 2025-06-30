const express = require("express");
const router = express.Router();

const { isValidUser } = require("../../middlewares/auth");
const {
  addNewSubscription,
  getAllSubscription,
  getSubscriptionForUserController,
  getSubscriptionForDriverController,
  deleteSubscription,
  updateSubscription,
} = require("./subscription.controller");

//Sign-up user
router.post("/", isValidUser, addNewSubscription);
router.patch("/:subId", isValidUser, updateSubscription);
router.get("/", getAllSubscription);
router.get("/user", getSubscriptionForUserController);
router.get("/driver", getSubscriptionForDriverController);
router.delete("/:subId", isValidUser, deleteSubscription);


module.exports = router;

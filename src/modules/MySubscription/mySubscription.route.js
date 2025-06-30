const express = require("express");
const router = express.Router();

const { isValidUser } = require("../../middlewares/auth");
const {
  getMySubscriptionDetails,
  purchasedSubscription,
  myPackages,
} = require("./mySubscription.controller");

router.post("/:subsId", isValidUser, purchasedSubscription);
router.get("/", isValidUser, getMySubscriptionDetails);
router.get("/my_packages", isValidUser, myPackages);

module.exports = router;

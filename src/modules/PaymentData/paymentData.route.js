const express = require("express");
const {
  addNewPaymentData,
  allPaymentList,
  getPaymentChart,
  createPaymentss,
  confirmPaymentss,
  confirmPaymentssInApp,
  totalEarning,
  todaysEarning,
} = require("./paymentData.controller");
const router = express.Router();
const { isValidUser } = require("../../middlewares/auth");

router.post("/", isValidUser, addNewPaymentData);
// router.get('/charts',  isValidUser, getPaymentChart);

router.post("/webhook", isValidUser, createPaymentss);

router.post("/confirm-payment-app", isValidUser, confirmPaymentssInApp);

router.get("/", isValidUser, allPaymentList);

router.get("/confirm-payment", confirmPaymentss);

router.get("/total_earning", isValidUser, totalEarning);
router.get("/todays_earning", isValidUser, todaysEarning);

module.exports = router;

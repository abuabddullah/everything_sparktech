const express = require("express");
const router = express.Router();

const { isValidUser } = require("../../middlewares/auth");
const {
  pendingShipment,
  currrentShipment,
  shippingHistory,
} = require("./shipment.controller");

router.get("/pending", isValidUser, pendingShipment);
router.get("/current", isValidUser, currrentShipment);
router.get("/history", isValidUser, shippingHistory);

module.exports = router;

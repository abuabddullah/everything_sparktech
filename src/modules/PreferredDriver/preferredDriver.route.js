const express = require("express");
const { isValidUser } = require("../../middlewares/auth");
const {
  addMyPreferredDriver,
  getPreferredDrivers,
  getAllMyPreferredDrivers,
} = require("./preferredDriver.controller");

const router = express.Router();

router.get("/", isValidUser, getPreferredDrivers);
router.get("/my_preferred_driver", isValidUser, getAllMyPreferredDrivers);
router.post("/", isValidUser, addMyPreferredDriver);

module.exports = router;

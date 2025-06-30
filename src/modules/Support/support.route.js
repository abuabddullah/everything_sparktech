const express = require("express");
const router = express.Router();
const { isValidUser } = require("../../middlewares/auth");
const { sentSupportMessage, contactUs } = require("./support.controller");

router.post("/", isValidUser, sentSupportMessage);
router.post("/contact", contactUs);

module.exports = router;

const express = require("express");
const router = express.Router();
const receiverController = require("./receiver.controller");

// POST route to create a new receiver
router.post("/create", receiverController.createReceiver);

module.exports = router;

const express = require("express");
const { addNewLoadRequests } = require("./loadRequest.controller");
const router = express.Router();

const { isValidUser } = require("../../middlewares/auth");

router.post("/", isValidUser, addNewLoadRequests);

module.exports = router;

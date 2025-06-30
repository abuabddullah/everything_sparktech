const express = require("express");
const { isValidUser } = require("../../middlewares/auth");
const {
  getMessagesByChatIdController,
  getAllMessagesController,
} = require("./message.controller");

const router = express.Router();

router.get("/", isValidUser, getAllMessagesController);

//get all messages by specefic chat id
router.get("/:chatId", isValidUser, getMessagesByChatIdController);

module.exports = router;

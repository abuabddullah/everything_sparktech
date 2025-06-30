const httpStatus = require("http-status");
const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const {
  createMessages,
  updateMessages,
  getMessagesByChatId,
  getMessagesById,
  deleteMessages,
  seenMessage,
} = require("./message.service");
const messageModel = require("./message.model");
const chatModel = require("../Chat/chat.model");
const { getMyChatList } = require("../Chat/chat.service");

const createMessagesController = catchAsync(async (req, res) => {
  const id = `${Math.floor(100000 + Math.random() * 900000)}${Date.now()}`;
  req.body.id = id;
  if (req.file) {
    const imageUrl = await uploadToS3({
      file: req.file,
      fileName: `images/messages/${req.body.chat}/${id}`,
    });

    req.body.imageUrl = imageUrl;
  }

  req.body.sender = req.user.userId;

  const result = await createMessages(req.body);

  return res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Message sent successfully",
        status: "OK",
        statusCode: httpStatus.OK,
        data: result,
      })
    );
});

// Get all messages
const getAllMessagesController = catchAsync(async (req, res) => {
  const result = await getAllMessages(req.query);

  return res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Messages retrieved successfully",
        status: "OK",
        statusCode: httpStatus.OK,
        data: result,
      })
    );
});

// Get messages by chat ID
const getMessagesByChatIdController = catchAsync(async (req, res) => {
  const chatId = req.params.chatId;
  const result = await getMessagesByChatId(chatId);
  return res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Messages retrieved successfully",
        status: "OK",
        statusCode: httpStatus.OK,
        data: result,
      })
    );
});

// Get message by ID
const getMessagesByIdController = catchAsync(async (req, res) => {
  const result = await getMessagesById(req.params.id);

  return res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Message retrieved successfully",
        status: "OK",
        statusCode: httpStatus.OK,
        data: result,
      })
    );
});

// Update message
const updateMessagesController = catchAsync(async (req, res) => {
  if (req.file) {
    const message = await messageModel.findById(req.params.id);
    if (!message) {
      throw new AppError(httpStatus.NOT_FOUND, "Message not found");
    }
    const imageUrl = await uploadToS3({
      file: req.file,
      fileName: `images/messages/${message.chat}/${message.id}`,
    });

    req.body.imageUrl = imageUrl;
  }

  const result = await updateMessages(req.params.id, req.body);

  return res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Message updated successfully",
        status: "OK",
        statusCode: httpStatus.OK,
        data: result,
      })
    );
});

//seen messages
const seenMessageController = catchAsync(async (req, res) => {
  const chatList = await chatModel.findById(req.params.chatId);
  if (!chatList) {
    throw new AppError(httpStatus.BAD_REQUEST, "chat id is not valid");
  }

  const result = await seenMessage(req.user.userId, req.params.chatId);

  const user1 = chatList.participants[0];
  const user2 = chatList.participants[1];
  // //----------------------ChatList------------------------//
  const ChatListUser1 = await getMyChatList(user1.toString());

  const ChatListUser2 = await getMyChatList(user2.toString());

  const user1Chat = "chat-list::" + user1;

  const user2Chat = "chat-list::" + user2;

  io.emit(user1Chat, ChatListUser1);
  io.emit(user2Chat, ChatListUser2);

  return res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Message seen successfully",
        status: "OK",
        statusCode: httpStatus.OK,
        data: result,
      })
    );
});
// Delete message
const deleteMessagesController = catchAsync(async (req, res) => {
  const result = await messagesService.deleteMessages(req.params.id);
  return res
    .status(httpStatus.OK)
    .json(
      response({
        message: "Message deleted successfully",
        status: "OK",
        statusCode: httpStatus.OK,
        data: result,
      })
    );
});

module.exports = {
  createMessagesController,
  getAllMessagesController,
  getMessagesByChatIdController,
  getMessagesByIdController,
  updateMessagesController,
  seenMessageController,
  deleteMessagesController,
};

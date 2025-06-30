// const Message = require("./message.model");

// const addMessage = async (messageBody) => {
//   const newMessge = await Message.create(messageBody);
//   return newMessge.populate('chat', 'participants')
// };

// const getMessages = async (chatId, options) => {
//   const { limit = 10, page = 1 } = options; // Set default limit and page values

//   const totalResults = await Message.countDocuments({
//     chat: chatId,
//   });

//   const totalPages = Math.ceil(totalResults / limit); // Calculate total pages

//   const pagination = { totalResults, totalPages, currentPage: page, limit }; // Create pagination object
//   const skip = (page - 1) * limit; // Calculate skip value

//   const messages = await Message.find({
//     chat: chatId,
//   })
//     .skip(skip)
//     .limit(limit)
//     .sort({ createdAt: -1 })
//     .populate('sender', 'fullName image');

//   return { messages, pagination };
// };

// const deleteMessage = (id) => {
//   return Message.findByIdAndDelete(id);
// }

// const getMessageByChatId = async (id) => {
//   const message = await Message.find({ chat: id })
//   // const message = await Message.find({chat: id}).populate('sender', 'name photo role');
//   return message;
// }

// const deleteMessagesByChatId = async (chatId) => {
//   return await Message.deleteMany({ chat: chatId });
// }

// module.exports = {
//   addMessage,
//   getMessages,
//   deleteMessage,
//   getMessageByChatId,
//   deleteMessagesByChatId
// };

const chatModel = require("../Chat/chat.model");
const Message = require("./message.model");

const createMessages = async (payload) => {
  const alreadyExists = await chatModel
    .findOne({
      participants: { $all: [payload.sender, payload.receiver] },
    })
    .populate(["participants"]);

  if (!alreadyExists) {
    const chatList = await Chat.create({
      participants: [payload.sender, payload.receiver],
    });
    //@ts-ignore
    payload.chat = chatList?._id;
  } else {
    //@ts-ignore
    payload.chat = alreadyExists?._id;
  }

  const result = await Message.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "Message creation failed");
  }

  //@ts-ignore
  const io = global.socketio;

  if (io) {
    const senderMessage = "new-message::" + result.chat.toString();

    io.emit(senderMessage, result);

    // //----------------------ChatList------------------------//
    const ChatListSender = await chatService.getMyChatList(
      result?.sender.toString()
    );
    const ChatListReceiver = await chatService.getMyChatList(
      result?.receiver.toString()
    );

    const senderChat = "chat-list::" + result.sender.toString();
    const receiverChat = "chat-list::" + result.receiver.toString();
    io.emit(receiverChat, ChatListSender);
    io.emit(senderChat, ChatListReceiver);
  }

  return result;
};

// Get all messages
const getAllMessages = async (query) => {
  const MessageModel = new QueryBuilder(
    Message.find().populate([
      {
        path: "sender",
        select: "name email image role _id phoneNumber username",
      },
      {
        path: "receiver",
        select: "name email image role _id phoneNumber username",
      },
    ]),
    query
  )
    .filter()
    // .paginate()
    .sort()
    .fields();

  const data = await MessageModel.modelQuery;
  const meta = await MessageModel.countTotal();
  return {
    data,
    meta,
  };
};

// Update messages
const updateMessages = async (id, payload) => {
  const result = await Message.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, "Message update failed");
  }
  return result;
};

// Get messages by chat ID
const getMessagesByChatId = async (chatId) => {
  const result = await Message.find({ chat: chatId });
  return result;
};

// Get message by ID
const getMessagesById = async (id) => {
  const result = await Message.findById(id).populate([
    {
      path: "sender",
      select: "name email image role _id phoneNumber username",
    },
    {
      path: "receiver",
      select: "name email image role _id phoneNumber username",
    },
  ]);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Oops! Message not found");
  }
  return result;
};

const deleteMessages = async (id) => {
  const message = await Message.findById(id);
  if (!message) {
    throw new AppError(httpStatus.NOT_FOUND, "Oops! Message not found");
  }
  if (message?.imageUrl) {
    await deleteFromS3(
      `images/messages/${message?.chat.toString()}/${message?.id}`
    );
  }

  const result = await Message.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Oops! Message not found");
  }
  return result;
};

const seenMessage = async (userId, chatId) => {
  const messageIdList = await Message.aggregate([
    {
      $match: {
        chat: chatId,
        seen: false,
        sender: { $ne: userId },
      },
    },
    { $group: { _id: null, ids: { $push: "$_id" } } },
    { $project: { _id: 0, ids: 1 } },
  ]);
  const unseenMessageIdList =
    messageIdList.length > 0 ? messageIdList[0].ids : [];

  const updateMessages = await Message.updateMany(
    { _id: { $in: unseenMessageIdList } },
    { $set: { seen: true } }
  );
  return updateMessages;
};

module.exports = {
  createMessages,
  getAllMessages,
  updateMessages,
  getMessagesByChatId,
  getMessagesById,
  deleteMessages,
  seenMessage,
};

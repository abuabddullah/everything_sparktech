const { getChatByParticipants, addChat } = require("../../modules/Chat/chat.service");

const addNewChat = async (socket, data, callback) => {
  let messageGiven = "Chat already successfully"
  if (data.participant) {
    if (data.participant === socket.decodedToken._id.toString()) {
      return callback({
        status: "Error",
        message: "You can not chat with yourself",
      });
    }
    let chatExists = await getChatByParticipants(
      socket.decodedToken._id,
      data.participant
    );
    if (chatExists && chatExists.status === "accepted") {
      messageGiven = "Chat already successfully"
    }
    else {
      chatExists = await addChat(socket.decodedToken._id, data.participant);
      messageGiven = "Chat created successfully"
    }

    callback({
      status: "Success",
      chatId: chatExists._id,
      message: messageGiven,
      user: chatExists.participants[0],
    });
  } else {
    callback({
      status: "Error",
      message: "Must provide at least 2 participants",
    });
  }
};

module.exports = addNewChat;

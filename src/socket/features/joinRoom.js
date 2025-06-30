const { getChatById } = require("../../modules/Chat/chat.service");

const joinRoom = async (socket, data, callback) => {
  const chatId = data.chatId;
  const chat = await getChatById(chatId);
  if (!chat) {
    return callback({ status: "Error", message: "Chat not found" });
  }
  const userExists = chat.participants.some(participant => participant._id.toString() === socket.decodedToken._id);

  if (!userExists) {
    return callback({ status: 'Error', message: 'User not authorized to join this chat' });
  }
  const roomId = 'vide-con-XX056-965125-room::' + chatId.toString();
  socket.join(roomId);
  socket.to(roomId).emit('user-joined', socket.decodedToken);
  return callback({ status: "Success", message: "Joined room successfully" });
};

module.exports = joinRoom;

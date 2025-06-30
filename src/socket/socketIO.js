const logger = require("../helpers/logger");
const socketAuthMiddleware = require("./auth/auth");

const addNewChat = require("./features/addNewChat");
const addNewMessage = require("./features/addNewMessage");
const getActiveUsers = require("./features/getActiveUsers");
// const userLiveLocationShare = require("./features/userLiveLocationShare");

const socketIO = (io) => {
  //initialize an object to store the active users
  let activeUsers = {};

  // middleware to authenticate the socket connection
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    //add the user to the active users list
    try {
      if (!activeUsers[socket?.decodedToken?._id]) {
        activeUsers[socket?.decodedToken?._id] = { ...socket?.decodedToken, id: socket?.decodedToken?._id };
        console.log(`User Id: ${socket?.decodedToken?._id} is just connected.`);
      } else {
        console.log(`User Id: ${socket?.decodedToken?._id} is already connected.`);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      logger.error(error, "-- socket.io connection error --");
    }
    
    // for creating new chat
    socket.on("add-new-chat", (data, callback) => addNewChat(socket, data, callback));

    // for adding new message
    socket.on("add-new-message", (data, callback) => addNewMessage(socket, data, callback));

    // for sharing live location
    // socket.on('live-location-share', (data, callback) => userLiveLocationShare(socket, data, callback));

    //call this to show is typing
    socket.on("typing", function (data) {
      const roomId = data.chatId.toString();
      const message = socket?.decodedToken?.fullName + " is typing...";
      socket.broadcast.emit(roomId, { message: message });
    });

    //get active users
    socket.on('get-active-users', (data, callback) => getActiveUsers(socket, data, callback, activeUsers));

    socket.on('disconnect', () => {
      delete activeUsers[socket?.decodedToken?._id];
      console.log(`User ID: ${socket?.decodedToken?._id} just disconnected`);
    });
  });
};

module.exports = socketIO;

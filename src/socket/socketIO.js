const { createLogger } = require("winston");
const logger = require("../helpers/logger");
const chatModel = require("../modules/Chat/chat.model");
const { getMyChatList } = require("../modules/Chat/chat.service");
const messageModel = require("../modules/Message/message.model");
const User = require("../modules/User/user.model");
const { chatService } = require("../modules/Chat/chat.service");
const socketAuthMiddleware = require("./auth/auth");
const { cpuCount } = require("os-utils");
const httpStatus = require("http-status");
const {
  addNotification,
} = require("../modules/Notification/notification.service");

async function getChatById(chatId) {
  try {
    const chat = await chatModel.findById(chatId).populate("loadId");

    if (!chat) {
      throw new Error(`Chat with ID ${chatId} not found`);
    }
    return chat;
  } catch (error) {
    throw error; // Rethrow to handle it in the calling function
  }
}

// const userLiveLocationShare = require("./features/userLiveLocationShare");

const drivers = {}; // Example storage for driver locations
const products = {}; // Example storage for product destinations

const collectLocation = [];

const socketIO = (io) => {
  //initialize an object to store the active users
  let activeUsers = {};
  io.use(socketAuthMiddleware);
  let onlineUsers = [];

  try {
    io.on("connection", (socket) => {
      //add the user to the active users list
      try {
        if (!activeUsers[socket?.decodedToken?._id]) {
          activeUsers[socket?.decodedToken?._id] = {
            ...socket?.decodedToken,
            id: socket?.decodedToken?._id,
          };
        } else {
          console.log(
            `User Id: ${socket?.decodedToken?._id} is already connected.`
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        logger.error(error, "-- socket.io connection error --");
      }

      const user = socket.decodedToken;

      try {
        socket.on("join", (data) => {
          const chatId = data.toString();
          socket.join(chatId);

          const userId = user._id.toString();

          if (!onlineUsers.includes(userId)) {
            onlineUsers.push(userId);
          }
          io.emit("online-users-updated", onlineUsers);
        });

        socket.on("send-new-message", async (message, callback) => {
          try {
            // Assuming `getChatById` fetches the chat object including the users array
            const chat = await getChatById(message.chat);

            let newMessage;
            let userData;
            if (chat) {
              callback({ success: true, message: newMessage, result: message });

              newMessage = await messageModel.create(message);
              let receiverId;

              if (chat.chatType === "shipper-receiver") {
                if (user._id === chat.loadId.receiverId.toString()) {
                  receiverId = chat.loadId.user;
                } else {
                  receiverId = chat.loadId.receiverId; // Assuming loadId has receiverId
                }
              } else if (chat.chatType === "shipper-driver") {
                if (user._id === chat.loadId.driver.toString()) {
                  receiverId = chat.loadId.user;
                } else {
                  receiverId = chat.loadId.driver; // Assuming loadId has driver
                }
              } else if (chat.chatType === "driver-receiver") {
                if (user._id === chat.loadId.receiverId.toString()) {
                  receiverId = chat.loadId.driver;
                } else {
                  receiverId = chat.loadId.receiverId; // Assuming loadId has driver
                }
              }
              // Emit notification to the receiver
              if (receiverId) {
                const onlineUser = onlineUsers.find(
                  (id) => id === receiverId?.toString()
                );

                if (!onlineUser) {
                  const notificationData = {
                    message: "You have got a new message",
                    type: "message",
                    role: socket.decodedToken.role,
                    linkId: newMessage._id,
                    sender: user._id,
                    receiver: receiverId,
                  };

                  await addNotification(notificationData);
                }
              }
            }

            const chatId = message?.chat;
            socket
              .to(chatId)
              .emit(`new-message-received::${message?.chat}`, message);
            // io.to(chatId).emit(`new-message-received::${message?.chat}`, message);
            // socket.emit(`new-message-received::${message?.chat}`, message);
          } catch (error) {
            console.error("Error fetching chat details:", error);
          }
        });

        socket.on("typing", async (message, callback) => {
          if (message.status === "true") {
            io.emit(`typing::${message.receiverId}`, true);
            callback({ success: true, message: message, result: message });
          } else {
            io.emit(`typing::${message.receiverId}`, false);
            callback({ success: false, message: message, result: message });
          }
        });

        // typing functionality end

        const locationBuffer = [];
        const LOCATION_LIMIT = 30;
        let lastUpdateTime = Date.now();

        socket.on("client_location", async (data, callback) => {
          const longitude = Number(data.lang);
          const latitude = Number(data.lat);

          locationBuffer.push({ longitude, latitude });

          if (locationBuffer.length >= LOCATION_LIMIT) {
            const currentTime = Date.now();
            const timeElapsed = currentTime - lastUpdateTime;
            if (timeElapsed >= 30 * 1000) {
              try {
                const lastLocation = locationBuffer[LOCATION_LIMIT - 1];
                await User.findByIdAndUpdate(
                  user?._id,
                  { $set: { "location.coordinates": [longitude, latitude] } },
                  { new: true }
                );

                locationBuffer.length = 0;
                lastUpdateTime = Date.now();
              } catch (error) {
                console.error("Error updating the database:", error.message);
              }
            } else {
              console.log(
                `Waiting for 1 minute. Time remaining: ${
                  30 - Math.floor(timeElapsed / 1000)
                } seconds`
              );
            }
          }
          callback({ success: true, message: "user data", result: data });
          // io.emit(`server_location::${user?._id?.toString()}`, data);
          io.emit(`server_location::${user?._id.toString()}`, data);
          socket.emit(`server_location::${user?._id.toString()}`, data);
        });

        // Leave a chat room start
        socket.on("leave", (chatId) => {
          socket.leave(chatId);

          // Remove user from onlineUsers
          const userId = socket?.decodedToken?._id?.toString();
          if (userId) {
            onlineUsers = onlineUsers.filter((id) => id !== userId);
            io.emit("online-users-updated", onlineUsers); // Notify all clients about the change
          }
        });
      } catch (error) {}

      socket.on("check", (data, callback) => {
        callback({ success: true });
      });

      socket.on("disconnect", () => {
        delete activeUsers[socket?.decodedToken?._id];
        console.log(`User ID: ${socket?.decodedToken?._id} just disconnected`);
      });
    });
  } catch (error) {}
};

module.exports = socketIO;

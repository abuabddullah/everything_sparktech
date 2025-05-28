import colors from 'colors';
import { Server, Socket } from 'socket.io';
import { logger } from '../shared/logger';

// // Store online users
// const onlineUsers = new Map<string, string>();
// Store online users as an object: { [userId]: socketId }
const onlineUsers: Record<string, string> = {};


const socket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(colors.blue('A user connected'));

    // Handle user connection
    socket.on('user_connected', (userId: string) => {
      // onlineUsers.set(userId, socket.id);
      onlineUsers[userId] = socket.id;
      logger.info(colors.green(`User ${userId} connected with socket ${socket.id}`));
    });

    // Handle joining chat room
    socket.on('join_chat', (chatId: string) => {
      socket.join(chatId);
      logger.info(colors.blue(`User joined chat room: ${chatId}`));
    });

    // Handle leaving chat room
    socket.on('leave_chat', (chatId: string) => {
      socket.leave(chatId);
      logger.info(colors.yellow(`User left chat room: ${chatId}`));
    });

    // Handle new message
    socket.on('new_message', (data: { chatId: string; message: any }) => {
      // Emit to all users in the chat room except sender
      socket.to(data.chatId).emit('receive_message', data.message);

      // Send notification to offline participants
      const notificationData = {
        type: 'new_message',
        chatId: data.chatId,
        message: data.message,
        timestamp: new Date()
      };

      // Broadcast notification to all users except sender
      socket.to(data.chatId).emit('chat_notification', notificationData);
    });

    // Handle typing status
    socket.on('typing', (data: { chatId: string; userId: string }) => {
      socket.to(data.chatId).emit('user_typing', data.userId);
    });

    // Handle stop typing
    socket.on('stop_typing', (data: { chatId: string; userId: string }) => {
      socket.to(data.chatId).emit('user_stop_typing', data.userId);
    });

    // Handle read receipts
    socket.on('message_read', (data: { chatId: string; messageId: string; userId: string }) => {
      socket.to(data.chatId).emit('message_read_by', {
        messageId: data.messageId,
        userId: data.userId
      });
    });

    // Handle disconnect
    // socket.on('disconnect', () => {
    //   // Remove user from online users
    //   for (const [userId, socketId] of onlineUsers.entries()) {
    //     if (socketId === socket.id) {
    //       onlineUsers.delete(userId);
    //       logger.info(colors.red(`User ${userId} disconnected`));
    //       break;
    //     }
    //   }
    // });

    socket.on('disconnect', () => {
      for (const userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
          logger.info(colors.red(`User ${userId} disconnected`));
          break;
        }
      }
    });
  });
};

export const socketHelper = { socket };

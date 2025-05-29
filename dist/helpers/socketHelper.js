"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHelper = void 0;
const colors_1 = __importDefault(require("colors"));
const logger_1 = require("../shared/logger");
// // Store online users
// const onlineUsers = new Map<string, string>();
// Store online users as an object: { [userId]: socketId }
const onlineUsers = {};
const socket = (io) => {
    io.on('connection', (socket) => {
        logger_1.logger.info(colors_1.default.blue('A user connected'));
        // Handle user connection
        socket.on('user_connected', (userId) => {
            // onlineUsers.set(userId, socket.id);
            onlineUsers[userId] = socket.id;
            logger_1.logger.info(colors_1.default.green(`User ${userId} connected with socket ${socket.id}`));
        });
        // Handle joining chat room
        socket.on('join_chat', (chatId) => {
            socket.join(chatId);
            logger_1.logger.info(colors_1.default.blue(`User joined chat room: ${chatId}`));
        });
        // Handle leaving chat room
        socket.on('leave_chat', (chatId) => {
            socket.leave(chatId);
            logger_1.logger.info(colors_1.default.yellow(`User left chat room: ${chatId}`));
        });
        // Handle new message
        socket.on('new_message', (data) => {
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
        socket.on('typing', (data) => {
            socket.to(data.chatId).emit('user_typing', data.userId);
        });
        // Handle stop typing
        socket.on('stop_typing', (data) => {
            socket.to(data.chatId).emit('user_stop_typing', data.userId);
        });
        // Handle read receipts
        socket.on('message_read', (data) => {
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
                    logger_1.logger.info(colors_1.default.red(`User ${userId} disconnected`));
                    break;
                }
            }
        });
    });
};
exports.socketHelper = { socket };

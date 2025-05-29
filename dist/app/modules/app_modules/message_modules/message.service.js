"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const chatRoom_model_1 = require("../chatRoom_modules/chatRoom.model");
const message_model_1 = require("./message.model");
const mongoose_1 = __importDefault(require("mongoose"));
const sendMessageToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // find by payload.chatId and add the message to the chat
        const chat = yield chatRoom_model_1.Chat.findById(payload.chatId).session(session);
        if (!chat) {
            throw new Error('Chat not found');
        }
        // save message to DB
        const response = yield message_model_1.Message.create([payload], { session });
        chat.messages.push(response[0]._id);
        yield chat.save({ session });
        yield session.commitTransaction();
        session.endSession();
        //@ts-ignore
        const io = global.io;
        if (io) {
            io.emit(`getMessage::${payload === null || payload === void 0 ? void 0 : payload.chatId}`, response[0]);
        }
        return response[0];
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getMessageByChatIDFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = yield message_model_1.Message.find({ chatId: id })
        .sort({ createdAt: -1 });
    return messages;
});
const sendMessage = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId } = payload, messageData = __rest(payload
    // Get chat participants
    , ["chatId"]);
    // Get chat participants
    const chat = yield chatRoom_model_1.Chat.findById(chatId).populate('participants', '_id');
    let message;
    if (chat) {
        message = yield message_model_1.Message.create(Object.assign({ chatId }, messageData));
        // @ts-ignore
        const socketIo = global.io;
        if (socketIo) {
            // Emit new message to all participants in the chat
            socketIo.to(chatId).emit('receive_message', message);
            // Send notifications to offline participants
            const notificationData = {
                type: 'new_message',
                chatId,
                message,
                timestamp: new Date()
            };
            socketIo.to(chatId).emit('chat_notification', notificationData);
        }
    }
    return message;
});
const markMessageAsRead = (chatId, messageId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    yield message_model_1.Message.findByIdAndUpdate(messageId, {
        $addToSet: { readBy: userId }
    });
    // @ts-ignore
    const socketIo = global.io;
    if (socketIo) {
        socketIo.to(chatId).emit('message_read_by', {
            messageId,
            userId
        });
    }
});
exports.MessageService = {
    sendMessageToDB, getMessageByChatIDFromDB,
    sendMessage,
    markMessageAsRead
};

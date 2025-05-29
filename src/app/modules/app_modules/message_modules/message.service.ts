import { Chat } from '../chatRoom_modules/chatRoom.model';
import { IMessage } from './message.interface';
import { Message } from './message.model';
import mongoose from 'mongoose';

const sendMessageToDB = async (payload: any): Promise<IMessage> => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // find by payload.chatId and add the message to the chat
        const chat = await Chat.findById(payload.chatId).session(session);
        if (!chat) {
            throw new Error('Chat not found');
        }
        // save message to DB
        const response = await Message.create([payload], { session });
        chat.messages!.push(response[0]._id);
        await chat.save({ session });

        await session.commitTransaction();
        session.endSession();

        //@ts-ignore
        const io = global.io;
        if (io) {
            io.emit(`getMessage::${payload?.chatId}`, response[0]);
        }

        return response[0];
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const getMessageByChatIDFromDB = async (id: any): Promise<IMessage[]> => {
    const messages = await Message.find({ chatId: id })
        .sort({ createdAt: -1 })
    return messages;
};



const sendMessage = async (payload: any): Promise<IMessage> => {
    const { chatId, ...messageData } = payload
    // Get chat participants
    const chat = await Chat.findById(chatId).populate('participants', '_id');
    let message: IMessage | any;


    if (chat) {
        message = await Message.create({
            chatId,
            ...messageData
        });
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
};

const markMessageAsRead = async (chatId: string, messageId: string, userId: string): Promise<void> => {
    await Message.findByIdAndUpdate(messageId, {
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
};
export const MessageService = {
    sendMessageToDB, getMessageByChatIDFromDB,
    sendMessage,
    markMessageAsRead
};
import { Chat } from '../chatRoom_modules/chatRoom.model';
import { IMessage } from './message.interface';
import { Message } from './message.model';
import mongoose from 'mongoose';

const sendMessageToDB = async (payload: any): Promise<IMessage> => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // save to DB
        const response = await Message.create([payload], { session });
        // find by payload.chatId and add the message to the chat
        const chat = await Chat.findById(payload.chatId).session(session);
        if (!chat) {
            throw new Error('Chat not found');
        }
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

const getMessageFromDB = async (id: any): Promise<IMessage[]> => {
    const messages = await Message.find({ chatId: id })
        .sort({ createdAt: -1 })
    return messages;
};

export const MessageService = { sendMessageToDB, getMessageFromDB };
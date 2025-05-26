import { model, Schema } from 'mongoose';
import { ChatModel, IChat } from './chatRoom.interface';

const chatSchema = new Schema<IChat, ChatModel>(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        messages: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Message',
                default: []
            }
        ],
        status: {
            type: Boolean,
            default: true
        }
    }
)

export const Chat = model<IChat, ChatModel>('Chat', chatSchema);
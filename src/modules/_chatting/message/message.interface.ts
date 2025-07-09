import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { RoleType } from './message.constant';

export interface IMessage {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId | // 
  text : String;
  embedding?: number[]; // This will hold the vector embedding
  attachments?: Types.ObjectId[];
  senderId :  Types.ObjectId; // 🔗
  conversationId : Types.ObjectId; // 🔗
  isDeleted? : boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessageModel extends Model<IMessage> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IMessage>>;
}
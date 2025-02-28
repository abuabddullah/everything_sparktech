import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Message } from './message.model';
import { IMessage } from './message.interface';
import { Server } from 'socket.io';

const createMessage = async (payload: IMessage): Promise<IMessage> => {
  const result = await Message.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create message!');
  }
  if (payload.group) {
    //@ts-ignore
    global.io?.emit(`NEW_GROUP_MESSAGE::${payload.to?.toString()}`, result);
  } else {
    //@ts-ignore
    global.io?.emit(`NEW_MESSAGE::${payload.to?.toString()}`, result);
  }
  return result;
};

const getAllMessages = async (
  queryFields: Record<string, any>
): Promise<IMessage[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? { $or: [{ message: { $regex: search, $options: 'i' } }] }
    : {};
  let queryBuilder = Message.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields).populate({
    path: 'from to',
    select: 'name email profile',
  });
  return await queryBuilder;
};

const getMessageById = async (id: string): Promise<IMessage | null> => {
  const result = await Message.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Message not found!');
  }
  return result;
};

const updateMessage = async (
  id: string,
  payload: IMessage
): Promise<IMessage | null> => {
  const isExistMessage = await getMessageById(id);
  if (!isExistMessage) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Message not found!');
  }

  const result = await Message.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update message!');
  }
  return result;
};

const deleteMessage = async (id: string): Promise<IMessage | null> => {
  const isExistMessage = await getMessageById(id);
  if (!isExistMessage) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Message not found!');
  }

  const result = await Message.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete message!');
  }
  return result;
};

export const MessageService = {
  createMessage,
  getAllMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
};

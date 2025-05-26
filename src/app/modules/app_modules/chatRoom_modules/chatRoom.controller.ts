import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import { ChatService } from "./chatRoom.service";
import sendResponse from "../../../../shared/sendResponse";

const createChat = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const { recieverParticipants } = req.body; // [objectId, objectId, ...]

    const participants = [user?.id, ...recieverParticipants];
    const chat = await ChatService.createChatToDB(participants);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Create Chat Successfully',
        data: chat,
    });
})

const getChat = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const search = req.query.search as string;
    const chatList = await ChatService.getChatFromDB(user, search);
  
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Chat Retrieve Successfully',
        data: chatList
    });
});

export const ChatController = { 
    createChat, 
    getChat
};
import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { GenericController } from '../../__Generic/generic.controller';
import { Conversation } from './conversation.model';
import { ConversationService } from './conversation.service';
import { StatusCodes } from 'http-status-codes';
import { ConversationParticipentsService } from '../conversationParticipents/conversationParticipents.service';
import ApiError from '../../../errors/ApiError';
import { IConversation } from './conversation.interface';
import { ConversationType } from './conversation.constant';
import { MessagerService } from '../message/message.service';
import { IMessage } from '../message/message.interface';
import { User } from '../../user/user.model';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';
import { populate } from 'dotenv';
import mongoose from 'mongoose';

let conversationParticipantsService = new ConversationParticipentsService();
let messageService = new MessagerService();

export class ConversationController extends GenericController<typeof Conversation, IConversation> {
  conversationService = new ConversationService();

  constructor() {
    super(new ConversationService(), 'Conversation');
  }

  // override // 1️⃣
  getAllWithPagination = catchAsync(async (req: Request, res: Response) => {
    //const filters = pick(req.query, ['_id', 'title']); // now this comes from middleware in router
    const filters =  omit(req.query, ['sortBy', 'limit', 'page', 'populate']); ;
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const populateOptions: (string | {path: string, select: string}[]) = [
      // {
      //   path: 'personId',
      //   select: 'name role' // name 
      // },
      // 'personId'
      
    ];

    let dontWantToInclude = '-groupName -groupProfilePicture -groupBio -groupAdmins -blockedUsers -deletedFor -isDeleted -updatedAt -createdAt -__v'; // Specify fields to exclude from the result
    
    const result = await this.service.getAllWithPagination(filters, options,populateOptions,dontWantToInclude);

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  /*************
   * 
   * ( Dashboard ) | Admin :: getAllConversationAndItsParticipantsBySiteId
   * 
   * *********** */
  getAllConversationAndItsParticipantsBySiteId = catchAsync(
    async (req: Request, res: Response) => {
      const { siteId } = req.query;

      const conversations = await Conversation.find({
        siteId: siteId,
        isDeleted: false, 
      }).select('-__v -type -updatedAt -lastMessage -deletedFor -groupAdmins -blockedUsers -groupBio -groupProfilePicture -groupName').populate(
        {
          path: 'siteId',
          select: 'name'
        }
      )

      // now we have to get all participants of each conversation

      const conversationsWithParticipants = await Promise.all(
        conversations.map(async (conversation) => {
          const participants = await conversationParticipantsService.getByConversationIdForAdminDashboard(
            conversation._id
          );
          
          return {
            ...conversation.toObject(),
            participants,
          };
        })
      );

      sendResponse(res, {
        code: StatusCodes.OK,
        data: conversationsWithParticipants,
        message: `All conversations with participants for siteId: ${siteId}`,
        success: true,
      });
    }
  );

  create = catchAsync(async (req: Request, res: Response) => {
    let type;
    let result: IConversation;
    // creatorId ta req.user theke ashbe
    //req.body.creatorId = req.user.userId;
    let { participants, message } = req.body; // type, attachedToId, attachedToCategory

    // type is based on participants count .. if count is greater than 2 then group else direct

    if (!participants) {
      // 🔥 test korte hobe logic ..
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Without participants you can not create a conversation'
      );
    }

    participants = [...participants, req.user.userId]; // add yourself to the participants list

    if (participants.length > 0) {
      type =
        participants.length > 2
          ? ConversationType.group
          : ConversationType.direct;

      const conversationData: IConversation = {
        creatorId: req.user.userId,
        type,
        siteId: req.body.siteId,
      };

      // check if the conversation already exists
      const existingConversation = await Conversation.findOne({
        creatorId: conversationData.creatorId,
      }).select('-isDeleted -updatedAt -createdAt -__v');

      if (!existingConversation){

        /***********
         * 
         * Create a new conversation
         * 
         * ********** */
    
        result = await this.service.create(conversationData); // 🎯🎯🎯🎯

        if (!result) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            'Unable to create conversation'
          );
        }

        for (const participant of participants) {
        
          // as participants is just an id .. 

          let user = await User.findById(participant).select('role');

          const res1 = await conversationParticipantsService.create({
            userId: participant,
            conversationId: result._id 
          });

          if (!res1) {
            throw new ApiError(
              StatusCodes.BAD_REQUEST,
              'Unable to create conversation participant'
            );
          }

          // console.log('🔥🔥res1🔥', res1);
          // } catch (error) {
          // console.error("Error creating conversation participant:", error);
          // }
        }

        if (message && result?._id) {
          const res1: IMessage | null = await messageService.create({
            text: message,
            senderId: req.user.userId,
            conversationId: result?._id,
            senderRole: req.user.role === RoleType.user ? RoleType.user : RoleType.bot,
          });
          if (!res1) {
            throw new ApiError(
              StatusCodes.BAD_REQUEST,
              'Unable to create conversation participant'
            );
          }
        }

        if(!message){
          const res1: IMessage | null = await messageService.create({
            text: "How are you feeling today ?",
            senderId: new mongoose.Types.ObjectId('68206aa9e791351fc9fdbcde'),  // this is bot id .. eta process.env file theke ashbe .. 
            conversationId: result?._id,
            senderRole: RoleType.bot,
          });

          // TODO :  there is nothing called lastMessageSenderRole in conversation model ..
          
          // also update the last message of the conversation 
          await Conversation.findByIdAndUpdate(
            result?._id,
            { lastMessageSenderRole: RoleType.bot}, // FIX ME : last message sender role bolte kichui nai .. 
            { new: true }
          ).select('-isDeleted -updatedAt -createdAt -__v');
        }
      }

      // dont need to create conversation .. 
      // just send message to the existing conversation

      let res1 ;
      if (message && existingConversation?._id && existingConversation?.canConversate) {
          let res1 : IMessage | null = await messageService.create({
            text: message,
            senderId: req.user.userId,
            conversationId: existingConversation?._id,
            senderRole: req.user.role === RoleType.user ? RoleType.user : RoleType.bot,
          });
          if (!res1) {
            throw new ApiError(
              StatusCodes.BAD_REQUEST,
              'Unable to create conversation participant'
            );
          }
        }

      sendResponse(res, {
        code: StatusCodes.OK,
        data: existingConversation ? existingConversation : result,
        message: existingConversation ?  `${this.modelName} already exist` : `${this.modelName} created successfully`,
        success: true,
      });
    }
  });

  addParticipantsToExistingConversation = catchAsync(
    async (req: Request, res: Response) => {
      
      const {
        participants,
        conversationId,
      }: { participants: string[]; conversationId: string } = req.body;

      const conversation = await this.service.getById(conversationId);
      if (!conversation) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
      }
      let result;
      // console.log('') // for testing .. 

      if (participants.length > 0) {
        for (const participantId of participants) {
          if (participantId !== req.user.userId) {
            const existingParticipant =
              await conversationParticipantsService.getByUserIdAndConversationId(
                participantId,
                conversationId
              );
              
            // console.log(
            //   'existingParticipant 🧪🧪',
            //   existingParticipant,
            //   existingParticipant.length
            // );

            if (existingParticipant.length == 0) {
              await conversationParticipantsService.create({
                userId: participantId,
                conversationId: conversation?._id,
                role: req.user.role === 'user' ? 'member' : 'admin',
              });

              sendResponse(res, {
                code: StatusCodes.OK,
                data: null,
                message: `Participents ${participantId}  added successfully  ${this.modelName}.. ${conversationId}`,
                success: true,
              });
            }
            sendResponse(res, {
              code: StatusCodes.OK,
              data: null,
              message: `Participents ${participantId} can not be added  ${this.modelName}.. ${conversationId}`,
              success: true,
            });
          }
        }

      }
    }
  );

  showParticipantsOfExistingConversation = catchAsync(
    async (req: Request, res: Response) => {
      const { conversationId } = req.query;

      if (!conversationId) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Without conversationId you can not show participants'
        );
      }

      const conversation = await this.service.getById(conversationId);
      if (!conversation) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
      }

      const res1 = await conversationParticipantsService.getByConversationId(
        conversationId
      );

      if (!res1) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'no participants found in this conversation'
        );
      }

      // 🔥🔥 Multiple er jonno o handle korte hobe .. single er jonno o handle korte hobe ..
      sendResponse(res, {
        code: StatusCodes.OK,
        data: res1,
        message: `Participents found successfully to this ${this.modelName}.. ${conversationId}`,
        success: true,
      });
    }
  );

  removeParticipantFromAConversation = catchAsync(
    async (req: Request, res: Response) => {
      const { conversationId, participantId } = req.body;

      if (!conversationId || !participantId) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Without conversationId and participantId you can not remove participants'
        );
      }

      const conversation = await this.service.getById(conversationId);
      if (!conversation) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Conversation not found');
      }

      const res1 =
        await conversationParticipantsService.getByUserIdAndConversationId(
          participantId,
          conversationId
        );

      if (!res1) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'no participants found in this conversation'
        );
      }

      const result = await conversationParticipantsService.deleteById(
        res1[0]._id
      );

      if (!result) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Unable to remove participant from the conversation.'
        );
      }

      sendResponse(res, {
        code: StatusCodes.OK,
        data: null,
        message: `Participant removed successfully from this ${this.modelName}.. ${conversationId}`,
        success: true,
      });
    }
  );

  // add more methods here if needed or override the existing ones
}
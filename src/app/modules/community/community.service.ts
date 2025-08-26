import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ICommunityFilterables, ICommunity } from './community.interface';
import { Community } from './community.model';
import { JwtPayload } from 'jsonwebtoken';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { communitySearchableFields } from './community.constants';
import { Types } from 'mongoose';
import { IUser } from '../user/user.interface';


const createCommunity = async (
  user: JwtPayload | undefined,
  payload: ICommunity
): Promise<ICommunity> => {
  try {

    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authorized');
    }

    const communityData = {
      ...payload,
      userId: user?.authId,
    };

    const result = await Community.create(communityData);
    if (!result) {
      
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Failed to create Community, please try again with valid data.'
      );
    }

    return result;
  } catch (error: any) {
    
    if (error.code === 11000) {
      throw new ApiError(StatusCodes.CONFLICT, 'Duplicate entry found');
    }
    throw error;
  }
};

const getAllCommunitys = async (
  user: JwtPayload,
  filterables: ICommunityFilterables,
  pagination: IPaginationOptions
) => {
  const { searchTerm, ...filterData } = filterables;
  const { page, skip, limit, sortBy, sortOrder } = paginationHelper.calculatePagination(pagination);

  const andConditions = [];

  // Search functionality
  if (searchTerm) {
    andConditions.push({
      $or: communitySearchableFields.map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  // Filter functionality
  if (Object.keys(filterData).length) {
    andConditions.push({
      $and: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }

  const whereConditions = andConditions.length ? { $and: andConditions } : {};

  const [result, total] = await Promise.all([
    Community
      .find(whereConditions)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder }).populate('userId', 'name email role'),
    Community.countDocuments(whereConditions),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getSingleCommunity = async (id: string): Promise<ICommunity> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Community ID');
  }

  const result = await Community.findById(id).populate('userId', 'name email role');
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested community not found, please try again with valid id'
    );
  }

  return result;
};

const updateCommunity = async (
  id: string,
  user: JwtPayload | undefined,
  payload: Partial<ICommunity>
): Promise<ICommunity | null> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Community ID');
  }

    if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authorized');
  }

  const community = await Community.findOne({ _id: id}).populate('userId');

  if (!community) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Community not found');
  }

  if (user.email !== (community?.userId as IUser | undefined)?.email) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to delete this community');
  }

  const result = await Community.findByIdAndUpdate(
    new Types.ObjectId(id),
    { $set: payload },
    {
      new: true,
      runValidators: true,
    }
  ).populate('userId');

  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Requested community not found, please try again with valid id'
    );
  }

  return result;
};

const deleteCommunity = async (id: string, user: JwtPayload | undefined): Promise<ICommunity> => {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Community ID');
  }

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authorized');
  }

  const community = await Community.findById({ _id: id }).populate('userId');

    if (!community) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Community not found');
  }
  console.log({ email: user.email, userId: community?.userId as IUser | undefined });
  if (user.email !== (community?.userId as IUser | undefined)?.email) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to delete this community');
  }

  const result = await Community.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      'Something went wrong while deleting community, please try again with valid id.'
    );
  }

  return result;
};



export const addAnswer = async (
  communityId: string,
  user: JwtPayload | undefined,
  answerData: { comments: any }
) => {
  if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authorized');
  if (!Types.ObjectId.isValid(communityId)) throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Community ID');

  const answer = {
    _id: new Types.ObjectId(),
    userId: user.authId,
    User: user.email || user.authId, // or grab username if available
    date: new Date().toISOString(),
    comments: answerData.comments,
  };

  const updated = await Community.findByIdAndUpdate(
    communityId,
    { $push: { answers: answer }, $inc: { answersCount: 1 } },
    { new: true }
  );

  if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, 'Community not found');
  return updated;
};



export const deleteAnswer = async (
  communityId: string,
  answerId: string,
  user: JwtPayload | undefined
) => {
  if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authorized');
  if (!Types.ObjectId.isValid(communityId)) throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Community ID');
  if (!Types.ObjectId.isValid(answerId)) throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Answer ID');


  const isCommunityExist = await Community.findById(communityId).populate('userId');

    if (!isCommunityExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Community not found');
  }

    const isAnswerExist = isCommunityExist?.answers?.find(answer => answer._id && answer._id.toString() === answerId);


  if (!isAnswerExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Answer not found');
  }

  if (user.email !== (isCommunityExist?.userId as IUser | undefined)?.email) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to delete this answer');
  }


  const updated = await Community.findByIdAndUpdate(
    communityId,
    { $pull: { answers: { _id: answerId } }, $inc: { answersCount: -1 } },
    { new: true }
  );

  if (!updated) throw new ApiError(StatusCodes.NOT_FOUND, 'Community not found');
};



const updateAnswer = async (
  communityId: string,
  answerId: string,
  user: JwtPayload | undefined,
  answerData: { comments: any }
) => {
  if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not authorized');
  if (!Types.ObjectId.isValid(communityId)) throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Community ID');
  if (!Types.ObjectId.isValid(answerId)) throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Answer ID');

  const communityObjectId = new Types.ObjectId(communityId);
  const answerObjectId = new Types.ObjectId(answerId);

  if (!answerData.comments) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Comments are required');
  }

  // Step 1: Use aggregation to verify community and answer existence & user ownership
  const result = await Community.aggregate([
    { $match: { _id: communityObjectId } },
    { $unwind: '$answers' },
    { $match: { 'answers._id': answerObjectId } },
    {
      $lookup: {
        from: 'users',                // assuming 'users' collection name
        localField: 'userId',
        foreignField: '_id',
        as: 'communityUser',
      },
    },
    { $unwind: '$communityUser' },
    {
      $project: {
        'communityUser.email': 1,
        'answers._id': 1,
        'answers.comments': 1,
      }
    }
  ]);

  if (!result.length) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Community or answer not found');
  }

  const communityUserEmail = result[0].communityUser.email;
  if (user.email !== communityUserEmail) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to update this answer');
  }

  // Step 2: Update the answer comments with arrayFilters
  const updated = await Community.findOneAndUpdate(
    { _id: communityObjectId },
    { $set: { 'answers.$[elem].comments': answerData.comments } },
    { new: true, arrayFilters: [{ 'elem._id': answerObjectId }] }
  );

  return updated;
};


export const CommunityServices = {
  createCommunity,
  getAllCommunitys,
  getSingleCommunity,
  updateCommunity,
  deleteCommunity,

  addAnswer,
  deleteAnswer,
  updateAnswer
};
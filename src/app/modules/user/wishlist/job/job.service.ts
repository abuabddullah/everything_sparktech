import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../../errors/ApiError';
import { UserService } from '../../user.service';
import { User } from '../../user.model';

const addJobToWishListToDB = async (jobId: string, userId: string) => {
  await UserService.getUserProfileFromDB({ id: userId });
  const update = await User.findByIdAndUpdate(userId, {
    $addToSet: { jobWishList: jobId },
  });
  if (!update) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Job not found');
  }
  return update;
};
const removeJobFromWishListFromDB = async (jobId: string, userId: string) => {
  await UserService.getUserProfileFromDB({ id: userId });
  const update = await User.findByIdAndUpdate(userId, {
    $pull: { jobWishList: jobId },
  });
  if (!update) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Job not found');
  }
  return update;
};
export const JobService = {
  addJobToWishListToDB,
  removeJobFromWishListFromDB,
};

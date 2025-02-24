import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../../errors/ApiError';
import { UserService } from '../../user.service';
import { User } from '../../user.model';

const addEventToWishListToDB = async (userId: string, eventId: string) => {
  await UserService.getUserProfileFromDB({ id: userId });
  const update = await User.findByIdAndUpdate(userId, {
    $addToSet: { eventWishList: eventId },
  });
  if (!update) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Job not found');
  }
  return update;
};
const removeEventFromWishListFromDB = async (
  userId: string,
  eventId: string
) => {
  await UserService.getUserProfileFromDB({ id: userId });
  const update = await User.findByIdAndUpdate(userId, {
    $pull: { eventWishList: eventId },
  });
  if (!update) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Job not found');
  }
  return update;
};
export const EventService = {
  addEventToWishListToDB,
  removeEventFromWishListFromDB,
};

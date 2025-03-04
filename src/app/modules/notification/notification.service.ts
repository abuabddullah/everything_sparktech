import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { UserController } from '../user/user.controller';
import { USER_ROLES } from '../../../enums/user';

const createNotification = async (
  payload: INotification
): Promise<INotification> => {
  const result = await Notification.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create notification!'
    );
  }
  //@ts-ignore
  const io = global.io;
  await io?.emit(`NEW_NOTIFICATION::${payload.user?.toString()}`, result);
  return result;
};

const getAllNotifications = async (
  queryFields: Record<string, any>,
  user: any
): Promise<any> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? {
        $or: [
          { description: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  let queryBuilder = Notification.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
  } else {
    queryBuilder = queryBuilder.skip(0).limit(10);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find({
    ...queryFields,
    ...(user.role === USER_ROLES.ADMIN ? {} : { user: user.id }),
  });
  await Notification.updateMany(
    {
      ...queryFields,
      ...(user.role === USER_ROLES.ADMIN ? {} : { user: user.id }),
    },
    { $set: { status: 'read' } }
  );
  const result = await queryBuilder;
  const totalNotification = await Notification.countDocuments(query);
  return {
    result,
    meta: {
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      total: result.length,
      totalPage: totalNotification / limit,
    },
  };
};

const getNotificationById = async (
  id: string
): Promise<INotification | null> => {
  const result = await Notification.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Notification not found!');
  }
  return result;
};

const updateNotification = async (
  id: string,
  payload: INotification
): Promise<INotification | null> => {
  const isExistNotification = await getNotificationById(id);
  if (!isExistNotification) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Notification not found!');
  }

  const result = await Notification.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update notification!'
    );
  }
  return result;
};

const deleteNotification = async (
  id: string
): Promise<INotification | null> => {
  const isExistNotification = await getNotificationById(id);
  if (!isExistNotification) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Notification not found!');
  }

  const result = await Notification.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to delete notification!'
    );
  }
  return result;
};

const getNotificationCount = async (user: any): Promise<number> => {
  const result = await Notification.countDocuments({
    ...(user.role === USER_ROLES.ADMIN ? {} : { user: user.id }),
    status: 'unread',
  });
  return result;
};

export const NotificationService = {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getNotificationCount,
};

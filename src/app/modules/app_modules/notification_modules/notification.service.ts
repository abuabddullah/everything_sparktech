import { JwtPayload } from 'jsonwebtoken';
import { INotification } from './notification.interface';
import { Notification } from './notification.model';
import { USER_ROLES } from '../../../../enums/user';
import QueryBuilder from '../../../builder/QueryBuilder';

// get notifications
const getNotificationFromDB = async (user: JwtPayload): Promise<INotification> => {

    const result = await Notification.find({ receiver: user.id });

    const unreadCount = await Notification.countDocuments({
        receiver: user.id,
        read: false,
    });

    const data: any = {
        result,
        unreadCount
    };

    return data;
};

// read notifications only for user
const readNotificationToDB = async (id: string): Promise<INotification | undefined> => {

    const result: any = await Notification.updateOne(
        { _id: id, read: false },
        { $set: { read: true } }
    );
    return result;
};

// get notifications for admin
const adminNotificationFromDB = async (query: Record<string, unknown>) => {
    const notificationQuery = new QueryBuilder(
        Notification.find({ type: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] } }),
        query,
    )
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await notificationQuery.modelQuery;
    const meta = await notificationQuery.getPaginationInfo();
    return { meta, result };
};

// read notifications only for admin
const adminReadNotificationToDB = async (): Promise<INotification | null> => {
    const result: any = await Notification.updateMany(
        { type: 'ADMIN', read: false },
        { $set: { read: true } },
        { new: true }
    );
    return result;
};

// get count of read and unread notifications for a user
const notificationReadUnreadCount = async (user: JwtPayload) => {
    const readCount = await Notification.countDocuments(
        { read: true },);

    const unreadCount = await Notification.countDocuments(
        { read: false },);

    return { readCount, unreadCount };
};

export const NotificationService = {
    adminNotificationFromDB,
    getNotificationFromDB,
    readNotificationToDB,
    adminReadNotificationToDB,
    notificationReadUnreadCount
};

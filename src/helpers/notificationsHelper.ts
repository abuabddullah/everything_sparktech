import { INotification } from "../app/modules/app_modules/notification_modules/notification.interface";
import { Notification } from "../app/modules/app_modules/notification_modules/notification.model";

export const sendNotifications = async (data: any): Promise<INotification> => {

    const result = await Notification.create(data);

    //@ts-ignore
    const socketIo = global.io;

    if (socketIo) {
        if (Array.isArray(data.receiver) && data.receiver.length > 0) {
            data.receiver.forEach((receiverId: string) => {
            // Emit the notification to the specific receiver
            socketIo.emit(`get-notification::${receiverId}`, result.text);
            });
        } else {
            // Emit to all connected clients if no receiverId is specified
            socketIo.emit("get-notification::all", result.text);
        }
    }

    return result;
}
import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';

const socket = (io: Server) => {
  io.on('connection', socket => {
    logger.info(colors.blue('A user connected'));

    // enabling notificaiton system
    socket.on("notification", (notificationData) => {
      console.log("new notification revieved from frontend", { notificationData })

      // 1. Acknowledge to sender only
      socket.emit("notification_reached_backend", { status: "ok", message: "notification_reached_backend", data: notificationData });
      // 2. Send notificationData to all others
      socket.broadcast.emit("new_notification", notificationData);
      // io.emit("new_notification",notificationData) // 3. (Alternatively) Broadcast to all including sender

    })
    /**
     * এখন frontend এর 
     * * যেখানে থেকে notification পাঠানো লাগবে সেখানে sockent.emit("notificaiont",{notfiTitle:"Notificaiont Title",notifiContent:"This is a new notification"})
     * * আর latest notification যেখানে দেখাতে চাই সেখানে socket.on("new_notificaiont",(notificationData)=>console.log({notificationData}))
     */

    //disconnect
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'));
    });
  });
};

export const socketHelper = { socket };

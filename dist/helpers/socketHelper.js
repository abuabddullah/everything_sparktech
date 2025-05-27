"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHelper = void 0;
const colors_1 = __importDefault(require("colors"));
const logger_1 = require("../shared/logger");
const socket = (io) => {
    io.on('connection', socket => {
        logger_1.logger.info(colors_1.default.blue('A user connected'));
        // enabling notificaiton system
        socket.on("notification", (notificationData) => {
            console.log("new notification revieved from frontend", { notificationData });
            // 1. Acknowledge to sender only
            socket.emit("notification_reached_backend", { status: "ok", message: "notification_reached_backend", data: notificationData });
            // 2. Send notificationData to all others
            socket.broadcast.emit("new_notification", notificationData);
            // io.emit("new_notification",notificationData) // 3. (Alternatively) Broadcast to all including sender
        });
        /**
         * এখন frontend এর
         * * যেখানে থেকে notification পাঠানো লাগবে সেখানে sockent.emit("notificaiont",{notfiTitle:"Notificaiont Title",notifiContent:"This is a new notification"})
         * * আর latest notification যেখানে দেখাতে চাই সেখানে socket.on("new_notificaiont",(notificationData)=>console.log({notificationData}))
         */
        //disconnect
        socket.on('disconnect', () => {
            logger_1.logger.info(colors_1.default.red('A user disconnect'));
        });
    });
};
exports.socketHelper = { socket };

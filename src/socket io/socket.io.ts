/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from 'socket.io';
import { sendNotification } from '../app/modules/AppSystem/Constants/updateRank';
import { Types } from 'mongoose';
const users = new Map<string, string>(); // userId -> socketId
let activeUsersChanged = false;

const getActiveUsers = () => {
  return Array.from(users.keys()).map((userId) => ({ userId }));
};

export const initSocket = (io: Server) => {
  //
  const emitActiveUsers = () => {
    if (!activeUsersChanged) return;
    const active = getActiveUsers();
    console.log('Emitting active users:', active);
    io.emit('activeUsers', active);
    activeUsersChanged = false;
  };

  const debounceEmitActiveUsers = (() => {
    let timeout: ReturnType<typeof setTimeout>;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(emitActiveUsers, 1000);
    };
  })();
  //

  io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    const logEvent = (eventName: string) => {
      socket.on(eventName, (data: any) => {
        console.log(`Event: ${eventName}`, data);
      });
    };

    const eventsToLog = ['setup', 'disconnect'];
    eventsToLog.forEach(logEvent);

    socket.onAny((event, ...args) => {
      const known = [
        'setup',
        'logout',
        'disconnect',
        'newInvest',
        'newTicket',
        'new user',
        'report',
        'new raffles',
        'new tickets',
        'invest',
        'winner',
        'join stripe account',
      ];
      if (!known.includes(event)) {
        console.log(`Unhandled socket event: ${event}`, args);
      }
    });

    socket.on('setup', (userData) => {
      if (!userData?._id || !Types.ObjectId.isValid(userData._id)) {
        console.log('Invalid setup payload');
        return;
      }
      const userId = userData._id.toString();
      socket.data.userId = userId;
      socket.join(userId);
      users.set(userId, socket.id);

      activeUsersChanged = true;
      debounceEmitActiveUsers();

      console.log(`User setup complete: ${userId}`);
      socket.emit('connected');
    });
    socket.on('new user', async (info) => {
      if (typeof info === 'string' && info.trim() !== '') {
        info = JSON.parse(info);
      }
      if (!info || !info._id || !Types.ObjectId.isValid(info._id)) {
        console.log('Invalid or missing user data!');
        return;
      }
      const senderId = info._id.toString();
      await sendNotification(info);
      socket.broadcast.emit('new user add message received', info); //adminOnly & -sender user

      const data = {
        title: 'Congratulations!',
        subTitle: 'Welcome to our home!',
        user: senderId,
        type: 'single',
      };
      socket.in(senderId).emit('congrats new user', data); //sender user only
      await sendNotification(data);
    });

    socket.on('report', async (info) => {
      if (typeof info === 'string' && info.trim() !== '') {
        info = JSON.parse(info);
      }
      if (!info || !info._id || !Types.ObjectId.isValid(info._id)) {
        console.log('Invalid report info');
        return;
      }
      socket.emit('report received', info); //admin only & -sender user
      await sendNotification(info);
    });

    socket.on('new raffles', async (info) => {
      if (typeof info === 'string' && info.trim() !== '') {
        info = JSON.parse(info);
      }
      if (!info) return;
      socket.emit('raffles message received', info); //global
      await sendNotification(info);
    });

    socket.on('new tickets', async (info) => {
      if (typeof info === 'string' && info.trim() !== '') {
        info = JSON.parse(info);
      }
      if (!info) return;
      socket.emit('ticket message received', info); //global
      await sendNotification(info);
    });

    socket.on('invest', async (info) => {
      if (typeof info === 'string' && info.trim() !== '') {
        info = JSON.parse(info);
      }
      console.log('investment successfull! ', info);
      if (!info) return;
      socket.emit('new invest message received', info); //global
      await sendNotification(info);
    });

    socket.on('winner', async (info) => {
      if (typeof info === 'string' && info.trim() !== '') {
        info = JSON.parse(info);
      }
      if (!info || !info._id || !Types.ObjectId.isValid(info._id)) return;

      const userId = info._id.toString();
      socket.broadcast.emit('winner message received', info); //global & -sender user
      await sendNotification(info);

      const data = {
        title: 'Congratulations on winning raffles!',
        subTitle: 'You have done a great job! Best wishes!',
        user: userId,
        type: 'single',
      };
      socket.in(userId).emit('congrats winner', data); //single user only
      await sendNotification(data);
    });

    socket.on('join stripe account', async (info) => {
      if (typeof info === 'string' && info.trim() !== '') {
        info = JSON.parse(info);
      }
      if (!info || !info._id || !Types.ObjectId.isValid(info._id)) return;

      const userId = info._id.toString();
      socket.broadcast.emit('new user connected on stripe!', info); //admin only & -sender user
      await sendNotification(info);

      const data = {
        title: 'Congratulations on your new Stripe connection!',
        subTitle:
          'You are now connected with us. You can withdraw money using the connected account!',
        user: userId,
        type: 'single',
      };
      socket.in(userId).emit('congrats to new stripe connector', data); //single user only
      await sendNotification(data);
    });

    socket.on('newTicket', (info) => {
      if (typeof info === 'string' && info.trim() !== '') {
        info = JSON.parse(info);
      }
      socket.emit('recentTicket', info); //global
    });

    socket.on('logout', () => {
      const userId = socket.data.userId;
      if (userId) {
        users.delete(userId);
        socket.leave(userId);
        activeUsersChanged = true;
        debounceEmitActiveUsers();
        console.log(`User logged out: ${userId}`);
      }
    });

    socket.on('disconnect', () => {
      const userId = socket.data.userId;
      if (userId && users.get(userId) === socket.id) {
        users.delete(userId);
        activeUsersChanged = true;
        debounceEmitActiveUsers();
        console.log(`User disconnected: ${userId}`);
      }
    });
  });
};

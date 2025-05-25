/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import config from './app/config';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import { Server } from 'socket.io';
import http from 'http';
import { initSocket } from './socket io/socket.io';
import { serverHome } from './app/modules/AppSystem/Constants/app.constant';

const app: Application = express();
const server = http.createServer(app);

// --- Middlewares ---
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: [config.origin_link as string], credentials: true }));

// --- Routes ---
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send(serverHome);
});

// --- Error Handling ---
app.use(globalErrorHandler);
app.use(notFound);

// --- Socket.io --- //
// Initialize Socket.IO
const io = new Server(server, {
  path: '/socket.io',
  pingTimeout: 60000,
  cors: {
    origin: [config.origin_link as string],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});

initSocket(io);

export { app, server, io };

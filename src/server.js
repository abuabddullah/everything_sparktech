const app = require("./app");
require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("./helpers/logger");
// Socket.io setup import
const { createServer } = require("http");
const socketIO = require("./socket/socketIO.js");
const socket = require("socket.io");
const seedAdmin = require("../DB/seedAdmin.js");
// Create a new server specifically for Socket.io
const socketServer = createServer();
const socketPort = process.env.SOCKET_PORT || 3002;
// Initialize Socket.io with the new server instance
const io = socket(socketServer, {
  cors: {
    origin: "*",
  },
  reconnection: true,
  reconnectionAttempts: 2,
  reconnectionDelay: 1000,
});

// // agenda setup import
// const setupAgenda = require('./agenda-tasks/agenda.js');

let server = null;

const port = process.env.BACKEND_PORT || 3001;
const serverIP = process.env.API_SERVER_IP || "localhost";

// let agenda;

async function myServer() {
  try {
    console.log("MONGODB_CONNECTION", process.env.MONGODB_CONNECTION);
    await mongoose.connect(process.env.MONGODB_CONNECTION);

    // Start Express server
    server = app.listen(port, () => {
      console.dir(
        `---> OOTMS server is listening on : http://${serverIP}:${port}`
      );
    });

    // Start Socket.io server
    // socketServer.listen(socketPort, serverIP, () => {
    socketServer.listen(socketPort, () => {
      console.dir(
        `---> Socket server is listening on: http://${serverIP}:${socketPort}`
      );
    });

    // Set up Socket.io event handlers
    socketIO(io);
    global.io = io;

    // agenda = setupAgenda(io);
  } catch (error) {
    console.error("Server start error:", error);
    logger.error({
      message: error.message,
      status: error.status || 500,
      method: "server-start",
      url: "server-start",
      stack: error.stack,
    });
    process.exit(1);
  }
}

myServer();
seedAdmin();

async function graceful(err) {
  console.error("Received shutdown signal or error:", err);
  logger.error({
    message: err.message,
    status: err.status || 500,
    method: "graceful",
    url: "server.js -> graceful",
    stack: err.stack,
  });
  // if (agenda) {
  //   await agenda.stop();
  // }
  if (server) {
    server.close(() => {
      process.exit(0);
    });
  }
  if (socketServer) {
    socketServer.close(() => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on("SIGINT", graceful);
process.on("SIGTERM", graceful);
process.on("uncaughtException", graceful);

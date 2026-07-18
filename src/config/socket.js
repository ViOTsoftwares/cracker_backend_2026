import { Server } from "socket.io";
import { ENV } from "./env.js";

let io;

export const initSocket = (server) => {
  const allowedOrigins = ENV.ALLOW_ORIGIN?.split(",")?.map((origin) => origin.trim()) || ["*"];

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A client connected to WebSocket", socket.id);

    // Allow admins to join a specific room for notifications
    socket.on("join_admin", () => {
      socket.join("admin_room");
      console.log(`Socket ${socket.id} joined admin_room`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

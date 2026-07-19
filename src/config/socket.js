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

/**
 * Emit an event to a specific room or client
 * @param {string} room - The room name or socket ID to emit to
 * @param {string} event - The name of the event
 * @param {any} data - The payload to send
 */
export const emitOne = (room, event, data) => {
  try {
    const ioInstance = getIO();
    ioInstance.to(room).emit(event, data);
  } catch (error) {
    console.error(`[Socket Error] Failed to emit event '${event}' to '${room}':`, error);
  }
};

/**
 * Emit an event to all connected clients globally
 * @param {string} event - The name of the event
 * @param {any} data - The payload to send
 */
export const emitAll = (event, data) => {
  try {
    const ioInstance = getIO();
    ioInstance.emit(event, data);
  } catch (error) {
    console.error(`[Socket Error] Failed to emit event '${event}' globally:`, error);
  }
};

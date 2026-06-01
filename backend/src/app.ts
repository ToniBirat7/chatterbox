import express from "express";
import { apiRouter, authRouter, healthRouter } from "./routes/index.js";
import { Server } from "socket.io";
import { createServer } from "node:http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authenticateJWTSocket } from "./middleware/middleware.js";
import { prisma } from "./lib/prisma.js";
import { FRONTEND_URL } from "./config/index.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use(authenticateJWTSocket);

// Track online members: userId → Member
const onlineMembers = new Map<string, Member>();

io.on("connection", (socket) => {
  const user = socket.data.user as Member & { id: string };
  const userId = user.id;

  // Each user joins their OWN room so they receive messages addressed to them
  socket.join(userId);

  const isNewUser = !onlineMembers.has(userId);

  if (isNewUser) {
    const member: Member = {
      id: userId,
      name: user.name,
      status: true,
      avatar: user.name.split(" ")[0]?.[0]?.toUpperCase() ?? "?",
    };

    // Broadcast new member to others in global room
    socket.to("_chat_room").emit("member", member);

    // Send existing online members to new user
    socket.emit("member", Array.from(onlineMembers.values()));

    onlineMembers.set(userId, member);
  } else {
    // Reconnect: send current member list
    socket.emit("member", Array.from(onlineMembers.values()));
  }

  // Join global group chat room
  socket.on("join-room", (roomId: string) => {
    socket.join(roomId);
    if (isNewUser) {
      const member = onlineMembers.get(userId);
      if (member) socket.to(roomId).emit("member", member);
    }
  });

  // 1-on-1 private message
  socket.on("send_private_message", async (msg: { id: string; text: string; sender: string; timestamp: string | Date }, receiverId: string) => {
    try {
      const text = msg.text?.trim();
      if (!text || text.length > 2000) return;

      await prisma.conversation.create({
        data: {
          senderId: userId,
          receiverId,
          message: text,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        },
      });

      // Send to receiver (in their own room)
      io.to(receiverId).emit("receive_private_message", {
        ...msg,
        text,
        sender: user.name,
        senderId: userId,
      });

      // Confirm back to sender
      io.to(userId).emit("receive_private_message", {
        ...msg,
        text,
        sender: "user",
        senderId: userId,
      });
    } catch (err) {
      console.error("Error saving private message:", err);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  // Group message
  socket.on("send_message", async (grpMsg: { id: string; text: string; sender: string; timestamp: string | Date }, roomId: string) => {
    try {
      const text = grpMsg.text?.trim();
      if (!text || text.length > 2000) return;

      await prisma.groupMessage.create({
        data: {
          senderId: userId,
          roomId,
          message: text,
          timestamp: grpMsg.timestamp ? new Date(grpMsg.timestamp) : new Date(),
        },
      });

      // Broadcast to others in room
      socket.to(roomId).emit("receive_message", {
        ...grpMsg,
        text,
        sender: user.name,
        senderId: userId,
        receiver: roomId,
      });

      // Confirm back to sender
      socket.emit("receive_message", {
        ...grpMsg,
        text,
        sender: "user",
        senderId: userId,
        receiver: roomId,
      });
    } catch (err) {
      console.error("Error saving group message:", err);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    onlineMembers.delete(userId);
    // Notify global room that user left
    socket.to("_chat_room").emit("member_left", { id: userId });
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});

// Middlewares
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/api/v1", apiRouter);

export { server };

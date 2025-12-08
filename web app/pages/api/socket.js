import { Server } from "socket.io";
import { verifyAccessToken } from "@/lib/auth/tokens";

export const config = {
  api: {
    bodyParser: false
  }
};

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/socket.io"
    });

    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      try {
        const payload = verifyAccessToken(token);
        socket.userId = payload.sub;
        return next();
      } catch {
        return next(new Error("Invalid token"));
      }
    });

    io.on("connection", (socket) => {
      const room = `user:${socket.userId}`;
      socket.join(room);

      socket.on("message", async (payload) => {
        console.log(`[Socket] Received message from ${socket.userId}:`, payload);
        try {
          const { getDb } = await import("@/lib/db/mongo");
          const db = await getDb();
          const messages = db.collection("chats");

          const doc = {
            ...payload,
            userId: socket.userId,
            savedAt: new Date()
          };

          console.log(`[Socket] Attempting to save to 'chats' collection for user ${socket.userId}`);

          // Upsert: Create the document if it doesn't exist, otherwise push to messages array
          const result = await messages.updateOne(
            { userId: socket.userId },
            { $push: { messages: doc } },
            { upsert: true }
          );
          console.log(`[Socket] Save result:`, result);
        } catch (e) {
          console.error("[Socket] Failed to save message", e);
        }

        // Broadcast to all of this user's devices (web + mobile) without inspecting ciphertext
        io.to(room).emit("message", payload);
      });

      socket.on("deleteMessage", (id) => {
        console.log(`[Socket] Broadcasting delete for message ${id} to room ${room}`);
        // Broadcast deletion event
        io.to(room).emit("deleteMessage", id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}



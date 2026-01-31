import http from "node:http";
import { Server } from "socket.io";

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Store connected users
const users = {}; // { socketId: username }
const rooms = {}; // { roomName: [socketId1, socketId2, ...] }

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle user login or registration
  socket.on("register", (username) => {
    users[socket.id] = username;
    console.log(`User registered: ${username}`);
  });

  // Handle one-to-one chat
  socket.on("private-message", ({ recipientId, message }) => {
    if (users[recipientId]) {
      io.to(recipientId).emit("private-message", {
        sender: users[socket.id],
        message,
      });
    } else {
      socket.emit("error", "User not found");
    }
  });

  // Handle group chat
  socket.on("join-room", (roomName) => {
    if (!rooms[roomName]) {
      rooms[roomName] = [];
    }
    rooms[roomName].push(socket.id);
    socket.join(roomName);
    console.log(`${users[socket.id]} joined room: ${roomName}`);
  });

  socket.on("group-message", ({ roomName, message }) => {
    if (rooms[roomName]) {
      socket.to(roomName).emit("group-message", {
        sender: users[socket.id],
        message,
      });
    } else {
      socket.emit("error", "Room not found");
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    const username = users[socket.id];
    delete users[socket.id];

    // Remove user from all rooms
    for (const roomName in rooms) {
      rooms[roomName] = rooms[roomName].filter((id) => id !== socket.id);
      if (rooms[roomName].length === 0) {
        delete rooms[roomName];
      }
    }

    console.log(`User ${username} has been removed`);
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

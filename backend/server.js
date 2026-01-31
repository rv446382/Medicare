import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"

import { Server } from "socket.io"
import { createServer } from "http";

import doctorModel from "./models/doctorModel.js"
import userModel from "./models/userModel.js"
import authUser from "./middleware/authUser.js"
import Chat from "./models/chatModel.js"
import bcrypt from 'bcrypt'

// app config
const app = express();
const port = 4000;

connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)

app.get('/api/pass/:pass', async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.params.pass || '', salt)
  res.send(hashedPassword);
})

app.get('/api/profile', authUser, async (req, res) => {
  const userType = req.userType;
  const userId = req.body.userId;

  if (userId && userType) {
    try {
      const user = userType == 'user'
        ? await userModel.findById(userId)
        : await doctorModel.findById(userId);

      res.status(200).json({ user, type: userType, success: true })
    } catch (error) {
      res.status(500).json({ success: false, error })
    }
  } else {
    res.status(401).json({ success: false, error: 'Access denied' })
  }
})

app.get("/", (req, res) => {
  res.send("API Working")
});

// socket.io
const users = {};
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// login, message, user-status, logout, chat (from frontend)
// user-status, new-message, user-status (from backend)
io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('login', async (id, type) => {
    console.log(`User {${type}} logged in: ${id}`);
    const user = type == 'user'
      ? await userModel.findById(id)
      : await doctorModel.findById(id);

    if (user) {
      user.isOnline = true;
      await user.save();

      users[id] = [socket.id, type];
      socket.join(id);

      io.emit('user-status', id, true, type);
    }
  });

  socket.on('user-status', (userId, callback) => {
    const isOnline = users[userId] ? true : false;
    callback(isOnline);
  });

  socket.on('peer', (userId, peerId) => {
    const socketId = users[userId];

    if (socketId) {
      io.to(socketId[0]).emit('peer', peerId);
    } else {
      console.log("PeerId", peerId)
    }
  })

  /**
   * @chatId chat id
   * @sender User type: user | doctor
   * @message text messages
   */
  socket.on('message', async (chatId, sender, message) => {
    const chat = await Chat.findById(chatId);
    const toSocketId = users[sender == 'user' ? chat.doctor : chat.user];

    // TODO: Solve isRead issue here
    // TODO: handle files
    chat.messages.push({ sender, message });
    await chat.save();

    if (toSocketId) {
      const senderUser = await (sender == 'user' ? userModel.findById(chat.user) : doctorModel.findById(chat.doctor));

      console.log("toSocketId", toSocketId)
      io.to(toSocketId[0]).emit('new-message', {
        chatId: chat._id,
        senderId: sender == 'user' ? chat.user : chat.doctor,
        message,
        sender,
        name: senderUser.name,
        createdAt: Date.now()
      });
    } else {
      const senderUser = sender == 'user' ? userModel.findById(chat.user) : doctorModel.findById(chat.doctor);

      const recieverUser = sender != 'user' ? userModel.findById(chat.user) : doctorModel.findById(chat.doctor);

      console.log("User {"+ recieverUser.name +"} is offline.")

      // TODO: send email here (Handle multiple mails)
    }
  });

  /**
   * @from User type: user | doctor
   * @userId Patient Id
   * @doctorId DoctorId
   */
  socket.on('chat', async (from, userId, doctorId, callback) => {
    let chat = await Chat.findOne({ doctor: doctorId, user: userId });
    if (!chat) {
      chat = await Chat.create({
        doctor: doctorId,
        user: userId,
        messages: []
      });
    }

    const lastMessage = chat.messages[chat.messages.length - 1];
    if (lastMessage && lastMessage.sender != from) {
      chat.messages.forEach((message => (message.isRead = true)));
      await chat.save();
    }

    callback(chat._id, chat.messages);
  });

  const disconnectUser = async (id) => {
    for (let userId in users) {
      if (users[userId][0] === id) {
        console.log(`User {${users[userId][1]}} logged out: ${userId}`);
        const user = users[userId][1] == 'user'
          ? await userModel.findById(userId)
          : await doctorModel.findById(userId);

        user.isOnline = false;
        await user.save();

        io.emit('user-status', userId, false, users[userId][1]);
        delete users[userId];
      }
    }
  }

  socket.on('logout', disconnectUser);

  socket.on('disconnect', () => disconnectUser(socket.id));
});

server.listen(port, () => console.log(`Server started on PORT:${port}`))
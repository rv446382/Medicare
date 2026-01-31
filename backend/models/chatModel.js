import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ["doctor", "user"],
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      isRead: { type: Boolean, default: false }
    },
  ],
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat

import  Chat  from '../models/chatModel';
import Doctor from '../models/doctorModel';
import User from '../models/userModel';

// 1. Create a new chat between doctor and user
export const createChat = async (req, res) => {
  const { doctorId, userId } = req.body; // Assuming doctorId and userId are sent in the body

  try {
    // Check if both doctor and user exist
    const doctor = await Doctor.findById(doctorId);
    const user = await User.findById(userId);

    if (!doctor || !user) {
      return res.status(404).json({ message: 'Doctor or User not found' });
    }

    // Create a new chat
    const newChat = new Chat({
      doctor: doctorId,
      user: userId,
      messages: [], // Start with an empty message array
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Send a message to the chat (from doctor or user)
export const sendMessage = async (req, res) => {
  const { chatId, sender, message } = req.body;

  try {
    // Validate sender
    if (sender !== 'doctor' && sender !== 'user') {
      return res.status(400).json({ message: 'Invalid sender' });
    }

    // Find the chat by chatId
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Add the new message to the chat's message array
    chat.messages.push({
      sender,
      message,
    });

    await chat.save();
    res.status(200).json({ message: 'Message sent successfully', chat });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. Get the chat history between doctor and user
export const getChatHistory = async (req, res) => {
  const { chatId } = req.params; // chatId is passed as a parameter

  try {
    // Fetch chat by chatId and populate doctor and user references
    const chat = await Chat.findById(chatId).populate('doctor user');
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

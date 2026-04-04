import mongoose from "mongoose";
import Message from "../models/Message.js";


// ===============================
// SEND MESSAGE
// ===============================
export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;

    if (!sender || !receiver || !text?.trim()) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const newMessage = await Message.create({
      sender,
      receiver,
      text: text.trim(),
    });

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);

    res.status(500).json({
      message: "Failed to send message",
    });
  }
};


// ===============================
// GET CHAT BETWEEN TWO USERS
// ===============================
export const getMessagesBetweenUsers = async (req, res) => {
  try {
    const { me, other } = req.params;

    if (!me || !other) {
      return res.status(400).json({
        message: "Invalid user IDs",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: me, receiver: other },
        { sender: other, receiver: me },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error);

    res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
};


// ===============================
// MARK AS SEEN
// ===============================
export const markMessagesSeen = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        message: "Missing senderId or receiverId",
      });
    }

    await Message.updateMany(
      {
        sender: senderId,
        receiver: receiverId,
        seen: false,
      },
      {
        $set: { seen: true },
      }
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.error("Seen update error:", error);

    res.status(500).json({
      message: "Failed to update seen status",
    });
  }
};


// ===============================
// UNREAD COUNT
// ===============================
export const getUnreadCounts = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId",
      });
    }

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(userId),
          seen: false,
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(unreadCounts);
  } catch (error) {
    console.error("Unread count error:", error);

    res.status(500).json({
      message: "Failed to fetch unread counts",
    });
  }
};
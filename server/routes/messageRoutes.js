import express from "express";
import mongoose from "mongoose";
import Message from "../models/Message.js";

const router = express.Router();

// ===============================
// SEND MESSAGE
// ===============================
router.post("/send", async (req, res) => {
  try {
    const { sender, receiver, text } = req.body;

    if (!sender || !receiver || !text?.trim()) {
      return res.status(400).json({
        message: "sender, receiver and text are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(sender) ||
      !mongoose.Types.ObjectId.isValid(receiver)
    ) {
      return res.status(400).json({
        message: "Invalid sender or receiver id",
      });
    }

    const newMessage = await Message.create({
      sender,
      receiver,
      text: text.trim(),
      seen: false,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "name photo city online lastActive")
      .populate("receiver", "name photo city online lastActive");

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
});

// ===============================
// GET UNREAD COUNTS
// ===============================
router.get("/unread/:userId", async (req, res) => {
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

    return res.status(200).json(unreadCounts);
  } catch (error) {
    console.error("Unread counts error:", error);

    return res.status(500).json({
      message: "Failed to fetch unread counts",
      error: error.message,
    });
  }
});

// ===============================
// MARK MESSAGES AS SEEN
// ===============================
router.patch("/seen", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        message: "senderId and receiverId are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({
        message: "Invalid senderId or receiverId",
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

    return res.status(200).json({
      success: true,
      message: "Messages marked as seen",
    });
  } catch (error) {
    console.error("Seen update error:", error);

    return res.status(500).json({
      message: "Failed to update seen status",
      error: error.message,
    });
  }
});

// ===============================
// GET MESSAGES BETWEEN TWO USERS
// ===============================
router.get("/:senderId/:receiverId", async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(senderId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({
        message: "Invalid senderId or receiverId",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    })
      .populate("sender", "name photo city online lastActive")
      .populate("receiver", "name photo city online lastActive")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error);

    return res.status(500).json({
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
});

export default router;
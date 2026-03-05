import express from "express";
import Interest from "../models/Interest.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * POST /api/interests/send
 * body: { fromUserId, toUserId }
 */
router.post("/send", async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;

    if (!fromUserId || !toUserId) {
      return res.status(400).json({ message: "fromUserId & toUserId required" });
    }
    if (fromUserId === toUserId) {
      return res.status(400).json({ message: "You cannot send interest to yourself" });
    }

    // ensure users exist
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);
    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const interest = await Interest.create({ fromUserId, toUserId });

    res.json({ message: "Interest sent ✅", interest });
  } catch (err) {
    // duplicate interest
    if (err.code === 11000) {
      return res.status(409).json({ message: "Interest already sent" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * GET /api/interests/inbox/:userId
 * received interests
 */
router.get("/inbox/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const list = await Interest.find({ toUserId: userId })
      .sort({ createdAt: -1 })
      .populate("fromUserId", "name email phone city gender age religion caste photo");

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * GET /api/interests/sent/:userId
 * sent interests
 */
router.get("/sent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const list = await Interest.find({ fromUserId: userId })
      .sort({ createdAt: -1 })
      .populate("toUserId", "name email phone city gender age religion caste photo");

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * PATCH /api/interests/:id
 * body: { status: "accepted" | "rejected" }
 */
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Interest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("fromUserId", "name email phone city gender age religion caste photo")
      .populate("toUserId", "name email phone city gender age religion caste photo");

    if (!updated) return res.status(404).json({ message: "Interest not found" });

    res.json({ message: "Updated ✅", interest: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
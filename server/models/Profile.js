import express from "express";
import Profile from "./models/Profile.js";

const router = express.Router();

/* CREATE PROFILE */
router.post("/", async (req, res) => {
  try {
    const data = { ...req.body };
    delete data._id;

    if (!data.email || !data.password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existing = await Profile.findOne({ email: data.email.trim() });

    if (existing) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    const profile = new Profile(data);
    await profile.save();

    res.status(201).json({
      message: "Profile created successfully",
      profile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const profile = await Profile.findOne({ email: email?.trim() });

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    if (profile.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      user: profile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET ALL PROFILES */
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 });
    res.status(200).json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET PROFILE BY ID */
router.get("/:id", async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* UPDATE PROFILE */
router.put("/:id", async (req, res) => {
  try {
    const data = { ...req.body };
    delete data._id;

    const updatedProfile = await Profile.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET PROFILE BY EMAIL */
router.get("/email/:email", async (req, res) => {
  try {
    const email = req.params.email.trim();
    const profile = await Profile.findOne({ email });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
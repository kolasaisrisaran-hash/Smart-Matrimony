import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ✅ MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("MongoDB Error ❌", err.message));

/* =========================
   ✅ Profile Schema (Users)
========================= */
const profileSchema = new mongoose.Schema(
  {
    name: String,
    gender: String,
    dob: String,
    age: Number,
    height: String,
    maritalStatus: String,
    motherTongue: String,
    religion: String,
    caste: String,
    subCaste: String,
    education: String,
    occupation: String,
    income: String,
    country: String,
    state: String,
    city: String,
    phone: String,
    fatherName: String,
    motherName: String,
    siblings: String,
    about: String,
    photo: String,
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
  },
  { timestamps: true }
);

const Profile = mongoose.model("Profile", profileSchema);

/* =========================
   ✅ Interest Schema
========================= */
const interestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// ✅ prevent duplicate requests (same from -> to)
interestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

const Interest = mongoose.model("Interest", interestSchema);

/* =========================
   ✅ Health
========================= */
app.get("/", (req, res) => res.send("Backend is running ✅"));

/* =========================
   ✅ AUTH
========================= */

// ✅ REGISTER
app.post("/api/register", async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    if (!password) return res.status(400).json({ message: "Password required" });

    const exists = await Profile.findOne({ email: rest.email });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const saved = await Profile.create({
      ...rest,
      passwordHash,
      status: "active",
    });

    const user = saved.toObject();
    delete user.passwordHash;

    res.status(201).json({ message: "Registered ✅", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userDoc = await Profile.findOne({ email });
    if (!userDoc) return res.status(404).json({ message: "User not found" });

    const status = userDoc.status || "active";
    if (status === "blocked") {
      return res.status(403).json({ message: "Account blocked by Admin 🚫" });
    }

    const ok = await bcrypt.compare(password, userDoc.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid password" });

    const user = userDoc.toObject();
    delete user.passwordHash;

    res.json({ message: "Login success ✅", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ CHANGE PASSWORD
app.post("/api/change-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const userDoc = await Profile.findOne({ email });
    if (!userDoc) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(oldPassword, userDoc.passwordHash);
    if (!ok) return res.status(401).json({ message: "Old password wrong" });

    const newHash = await bcrypt.hash(newPassword, 10);
    userDoc.passwordHash = newHash;
    await userDoc.save();

    res.json({ message: "Password changed ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   ✅ PROFILES
========================= */

// ✅ Get all profiles
app.get("/api/profiles", async (req, res) => {
  const users = await Profile.find({}, { passwordHash: 0 });
  res.json(users);
});

// ✅ Get single profile by id
app.get("/api/profiles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Profile.findById(id, { passwordHash: 0 });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Admin update user profile (no password)
app.patch("/api/profiles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { password, passwordHash, ...updates } = req.body;

    const updated = await Profile.findByIdAndUpdate(id, updates, {
      new: true,
      projection: { passwordHash: 0 },
    });

    if (!updated) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated ✅", user: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Delete user
app.delete("/api/profiles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Profile.findByIdAndDelete(id);
    res.json({ message: "User deleted ✅" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ Block/Unblock
app.patch("/api/profiles/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Profile.findByIdAndUpdate(
      id,
      { status },
      { new: true, projection: { passwordHash: 0 } }
    );

    res.json({ message: `User ${status} ✅`, user: updated });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* =========================
   ✅ INTEREST SYSTEM
========================= */

// ✅ SEND Interest
app.post("/api/interests/send", async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;

    if (!fromUserId || !toUserId) {
      return res.status(400).json({ message: "fromUserId & toUserId required" });
    }
    if (fromUserId === toUserId) {
      return res.status(400).json({ message: "You cannot send interest to yourself" });
    }

    const fromUser = await Profile.findById(fromUserId);
    const toUser = await Profile.findById(toUserId);
    if (!fromUser || !toUser) return res.status(404).json({ message: "User not found" });

    const interest = await Interest.create({ fromUserId, toUserId, status: "pending" });

    res.json({ message: "Interest sent ✅", interest });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Interest already sent" });
    }
    res.status(500).json({ message: err.message });
  }
});

// ✅ INBOX (received)
app.get("/api/interests/inbox/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const list = await Interest.find({ toUserId: userId })
      .sort({ createdAt: -1 })
      .populate("fromUserId", "name email phone city gender age religion caste photo");

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ SENT
app.get("/api/interests/sent/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const list = await Interest.find({ fromUserId: userId })
      .sort({ createdAt: -1 })
      .populate("toUserId", "name email phone city gender age religion caste photo");

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ ACCEPT / REJECT
app.patch("/api/interests/:id", async (req, res) => {
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
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   ✅ Start Server
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);